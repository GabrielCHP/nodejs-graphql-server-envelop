# Node.js GraphQL Server with Envelop

![Node.js](https://img.shields.io/badge/node-%3E%3D22-green)
![GraphQL](https://img.shields.io/badge/graphql-16.x-blue)
![HTTP](https://img.shields.io/badge/http-native-lightgrey)
![GraphiQL](https://img.shields.io/badge/graphiql-embedded-yellow)
![Envelop](https://img.shields.io/badge/envelop-plugin-orange)
![TypeScript](https://img.shields.io/badge/typescript-enabled-blue)
![Render](https://img.shields.io/badge/render-deployed-brightgreen)

A minimal **Node.js GraphQL server** using **Envelop** for plugin-based architecture.  
This project extends a pure Node.js GraphQL server with:

- **Envelop** plugin system for middleware-like extensions  
- **Validation cache** to optimize repeated queries  
- **Custom logging** and timing of GraphQL operations  
- **Basic authentication** via Bearer token  
- Embedded **GraphiQL UI**  
- Fully written in **TypeScript**  

---

## Run Locally

1. Install dependencies:

```
npm install
```

2. Run the server:

```
npm run dev
```

3. Open GraphiQL UI:

[http://localhost:8080/](http://localhost:8080/)

---

## Endpoints

| Path       | Method | Description                                   |
|------------|--------|-----------------------------------------------|
| `/graphql` | POST   | Main GraphQL endpoint with Envelop middleware |
| `/`        | GET    | Interactive GraphiQL UI                       |

---

## GraphQL Queries (Examples)

### 1. Hello query

```
query Hello {
  hello
}
```

### 2. Get all users

```
query GetUsers {
  users {
    id
    name
    email
  }
}
```

### 3. Get a single user by ID

```
query GetUser {
  user(id: "2") {
    id
    name
  }
}
```

---

## GraphQL Mutation

### Send a message

```
mutation SendMessage {
  sendMessage(message: "Hello from GraphiQL") {
    message
    timestamp
  }
}
```

---

## Curl Examples

### Query Hello

``` 
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-token" \
  -d "{\"query\":\"query Hello { hello }\",\"operationName\":\"Hello\"}"
```

### Query All Users

``` 
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-token" \
  -d "{\"query\":\"query GetUsers { users { id name email } }\",\"operationName\":\"GetUsers\"}"
```

### Query Single User

``` 
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-token" \
  -d "{\"query\":\"query GetUser { user(id: \\\"2\\\") { id name email } }\",\"operationName\":\"GetUser\"}"
```

### Mutation: Send Message

``` 
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret-token" \
  -d "{\"query\":\"mutation SendMessage { sendMessage(message: \\\"Hello from curl\\\") { message timestamp } }\",\"operationName\":\"SendMessage\"}"
```

---

## Notes / Example Logs

When running the server and executing queries or mutations, you will see logs like:

```
➡️ Incoming GraphQL request: Hello
⏱️ GraphQL [Hello] executed in 2ms
✅ Request executed successfully

➡️ Incoming GraphQL request: GetUsers
⏱️ GraphQL [GetUsers] executed in 1ms
✅ Request executed successfully

➡️ Incoming GraphQL request: GetUser
⏱️ GraphQL [GetUser] executed in 0ms
✅ Request executed successfully

➡️ Incoming GraphQL request: SendMessage
⏱️ GraphQL [SendMessage] executed in 1ms
✅ Request executed successfully
```

This demonstrates:

- **Operation names** appear instead of `anonymous`  
- **Execution time** is logged for each request  
- **Success or errors** are immediately visible  

---

## Features

### GraphQL Schema (`src/schema.ts`)

- **Defines GraphQL types, queries, and mutations** using SDL (`buildSchema`)  
- **User type**: `id`, `name`, `email`  
- **Message type**: `message`, `timestamp`  
- **Queries**: `hello`, `users`, `user(id: ID!)`  
- **Mutation**: `sendMessage(message: String!)`  
- **Resolvers**: functions in `root` return static data for queries and generate timestamps for mutations  

### Envelop Plugins (`src/server.ts`)

- **useEngine**: integrates GraphQL execution engine  
- **useValidationCache**: caches validation results for repeated queries  
- **useTiming**: logs execution time of GraphQL requests  
- **useLogger**: logs incoming requests, operation names, and errors or success  
- **useAuth**: reads `Authorization` header and attaches `user` to context; blocks unauthenticated requests  

### Server (`src/server.ts`)

- Uses native **http module** for serving GraphQL and GraphiQL UI  
- GET `/` serves GraphiQL interface  
- POST `/graphql` parses JSON body, executes GraphQL queries using Envelop, and returns JSON responses  
- Fully written in **TypeScript** with typed context (`MyContext`)  

---

## TODO / Improvements

- **Move secret token to environment variable**  
  Avoid hardcoding the Bearer token in the code. Use `process.env.AUTH_TOKEN` for security.

- **Add role-based authorization**  
  Extend `useAuth` plugin to handle multiple roles (admin, user, guest) for more granular access control.

- **Implement rate limiting**  
  Prevent abuse of the GraphQL endpoint by limiting request rate per IP or user.

- **Enable logging to file**  
  Instead of only console logging, save logs to a file or use a logging library like `winston` for production monitoring.

- **Add input validation**  
  Validate mutation inputs and query arguments before execution to avoid runtime errors and improve security.

- **Add more Envelop plugins**  
  Consider using plugins for depth limiting, query complexity, and error masking to improve security and performance.

- **Set up environment-specific configuration**  
  Use `.env` or a configuration library to manage different environments (development, staging, production).

- **Enable CORS**  
  Allow cross-origin requests if the server will be accessed from different frontends.

- **Add tests**  
  Write unit and integration tests for resolvers, plugins, and the server endpoints.

- **Add GraphQL subscriptions** *(optional)*  
  If real-time features are needed, implement subscriptions using WebSocket transport with Envelop.

---

## Technology Stack

- **Node.js >=22** – JavaScript runtime  
- **graphql 16.x** – Official GraphQL implementation for Node.js  
- **http** – Native HTTP server  
- **GraphiQL** – Embedded interactive IDE  
- **Envelop** – Plugin system for GraphQL  
- **TypeScript** – Strict type-checking and compiler options  
- **Render.com** – Zero-config deployment  

---

## Deploy in 10 seconds

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
