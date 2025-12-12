import { buildSchema } from 'graphql'; // GraphQL function to create a schema from SDL (Schema Definition Language)

// ---------------------------
// GraphQL Schema
// ---------------------------
// Defines types, queries, and mutations that the server supports
export const schema = buildSchema(`
  # User type with required fields
  type User {
    id: ID!       # Unique identifier
    name: String! # User's name
    email: String!# User's email
  }

  # Message type returned by sendMessage mutation
  type Message {
    message: String!   # The message content
    timestamp: String! # Time the message was sent
  }

  # Root Query type
  type Query {
    hello: String!          # Returns a simple greeting
    users: [User!]!         # Returns a list of all users
    user(id: ID!): User     # Returns a single user by ID
  }

  # Root Mutation type
  type Mutation {
    sendMessage(message: String!): Message! # Allows sending a message
  }
`);

// ---------------------------
// Resolvers (root object)
// ---------------------------
// Defines how each field is resolved, i.e., where the data comes from
export const root = {
  // Resolver for 'hello' query
  hello: () => 'Hello from Envelop!', // Returns a static string

  // Resolver for 'users' query
  users: () => [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
    { id: '3', name: 'Carol', email: 'carol@example.com' },
  ], // Returns a static array of users

  // Resolver for 'user' query by ID
  user: ({ id }: { id: string }) =>
    [
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
      { id: '3', name: 'Carol', email: 'carol@example.com' },
    ].find(u => u.id === id), // Finds and returns the user with the matching ID

  // Resolver for 'sendMessage' mutation
  sendMessage: ({ message }: { message: string }) => ({
    message, // Return the same message
    timestamp: new Date().toISOString(), // Return current timestamp
  }),
};
