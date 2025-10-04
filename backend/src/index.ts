import express from "express";
import { ApolloServer } from "apollo-server-express";
import * as dotenv from "dotenv";

dotenv.config();
import { readFileSync } from "fs";
import path from "path";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { connectToDatabase } from "./db";
import { getUser } from "./auth";
import resolvers from "./resolvers";

const typeDefs = readFileSync(path.join(__dirname, "../../shared/schema.graphql"), "utf-8");

async function start() {
  const app = express();
  const db = await connectToDatabase();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const user = await getUser(req, db);
      return { db, req, user };
    },
  });
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