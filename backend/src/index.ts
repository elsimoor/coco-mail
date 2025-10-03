import express from "express";
import { ApolloServer } from "apollo-server-express";
import { readFileSync } from "fs";
import path from "path";
import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = readFileSync(path.join(__dirname, "../../shared/schema.graphql"), "utf-8");

const resolvers = {
  Query: {
    me: () => null,
    users: () => [],
    messagesWith: () => []
  },
  Mutation: {
    register: (_: any, args: any) => {
      return { id: "1", email: args.email, name: args.name, roles: ["user"], createdAt: new Date().toISOString() };
    },
    login: (_: any, args: any) => {
      return "JWT-TOKEN-PLACEHOLDER";
    },
    sendMessage: (_: any, args: any) => {
      return { id: "m1", senderId: "1", receiverId: args.receiverId, ciphertext: args.ciphertext, createdAt: new Date().toISOString() };
    }
  }
};

async function start() {
  const app = express();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({ schema });
  await server.start();

  server.applyMiddleware({ app, path: "/graphql" });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

start().catch((err) => {
  console.error(err);
});