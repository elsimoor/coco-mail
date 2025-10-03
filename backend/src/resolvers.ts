import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { getDomains, createAccount, getToken, getMessages } from './services/email';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

const resolvers = {
  Query: {
    me: (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to perform this action.", {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return {
        ...context.user,
        id: context.user._id,
      };
    },
    users: (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to perform this action.", {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return [];
    },
    messagesWith: (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to perform this action.", {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return [];
    },
    getEphemeralMessages: async (_: any, { address, password }: { address: string, password: string }) => {
      try {
        const token = await getToken(address, password);
        const messages = await getMessages(token);
        return messages;
      } catch (error) {
        console.error('Error fetching ephemeral messages:', error);
        throw new GraphQLError('Could not fetch messages', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    }
  },
  Mutation: {
    register: async (_: any, args: any, context: any) => {
      const { db } = context;
      const { email, password, name } = args;

      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        throw new GraphQLError("User with this email already exists", {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        email,
        password: hashedPassword,
        name,
        roles: ["user"],
        createdAt: new Date().toISOString(),
      };

      const result = await db.collection("users").insertOne(newUser);

      return {
        id: result.insertedId,
        ...newUser,
      };
    },
    login: async (_: any, args: any, context: any) => {
      const { db } = context;
      const { email, password } = args;

      const user = await db.collection("users").findOne({ email });
      if (!user) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const token = jwt.sign({ userId: user._id, roles: user.roles }, JWT_SECRET, {
        expiresIn: "1d",
      });

      return token;
    },
    sendMessage: (_: any, args: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to perform this action.", {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return { id: "m1", senderId: context.user._id, receiverId: args.receiverId, ciphertext: args.ciphertext, createdAt: new Date().toISOString() };
    },
    createEphemeralEmail: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("You must be logged in to perform this action.", {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      try {
        const domains = await getDomains();
        if (!domains || domains.length === 0) {
          throw new GraphQLError('No domains available', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        const domain = domains[0].domain;
        const username = randomBytes(8).toString('hex');
        const address = `${username}@${domain}`;
        const password = randomBytes(12).toString('hex');

        await createAccount(address, password);

        return {
          address,
          password,
        };
      } catch (error) {
        console.error('Error creating ephemeral email:', error);
        throw new GraphQLError('Could not create ephemeral email', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
  }
};

export default resolvers;