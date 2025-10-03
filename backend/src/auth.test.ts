import { Db, Collection } from 'mongodb';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import path from 'path';
import resolvers from './resolvers';
import { getUser } from './auth';
import { connectToDatabase } from './db';

const typeDefs = readFileSync(path.join(__dirname, '../../shared/schema.graphql'), 'utf-8');

describe('Auth Resolvers', () => {
  let db: Db;
  let usersCollection: Collection;
  let server: ApolloServer;

  beforeAll(async () => {
    db = await connectToDatabase();
    usersCollection = db.collection('users');

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    server = new ApolloServer({
      schema,
      context: async ({ req }) => {
        const user = await getUser(req as any, db);
        return { db, req, user };
      },
    });
  });

  afterAll(async () => {
    if (usersCollection) {
      await usersCollection.deleteMany({});
    }
  });

  beforeEach(async () => {
    await usersCollection.deleteMany({});
  });

  // Test registration
  it('should register a new user', async () => {
    const REGISTER_MUTATION = `
      mutation Register($email: String!, $password: String!, $name: String) {
        register(email: $email, password: $password, name: $name) {
          id
          email
          name
        }
      }
    `;

    const response = await server.executeOperation({
      query: REGISTER_MUTATION,
      variables: { email: 'test@example.com', password: 'password123', name: 'Test User' },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.register.email).toBe('test@example.com');
    expect(response.data?.register.name).toBe('Test User');
    const userInDb = await usersCollection.findOne({ email: 'test@example.com' });
    expect(userInDb).not.toBeNull();
  });

  // Test login
  it('should login a registered user', async () => {
    // First, register a user
    const REGISTER_MUTATION = `
      mutation Register($email: String!, $password: String!, $name: String) {
        register(email: $email, password: $password, name: $name) {
          id
        }
      }
    `;
    await server.executeOperation({
      query: REGISTER_MUTATION,
      variables: { email: 'login@example.com', password: 'password123', name: 'Login User' },
    });

    const LOGIN_MUTATION = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password)
      }
    `;

    const response = await server.executeOperation({
      query: LOGIN_MUTATION,
      variables: { email: 'login@example.com', password: 'password123' },
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.login).toBeDefined();
    expect(typeof response.data?.login).toBe('string');
  });

  // Test me query
  it('should fetch the current user with the me query', async () => {
    // Register and login a user to get a token
    const REGISTER_MUTATION = `
      mutation Register($email: String!, $password: String!, $name: String) {
        register(email: $email, password: $password, name: $name) {
          id
        }
      }
    `;
    await server.executeOperation({
      query: REGISTER_MUTATION,
      variables: { email: 'me@example.com', password: 'password123', name: 'Me User' },
    });

    const LOGIN_MUTATION = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password)
      }
    `;
    const loginResponse = await server.executeOperation({
      query: LOGIN_MUTATION,
      variables: { email: 'me@example.com', password: 'password123' },
    });
    const token = loginResponse.data?.login;

    const ME_QUERY = `
      query Me {
        me {
          id
          email
          name
        }
      }
    `;
    const meResponse = await server.executeOperation(
      {
        query: ME_QUERY,
      },
      {
        contextValue: {
          req: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        },
      }
    );

    expect(meResponse.errors).toBeUndefined();
    expect(meResponse.data?.me.email).toBe('me@example.com');
    expect(meResponse.data?.me.name).toBe('Me User');
  });
});