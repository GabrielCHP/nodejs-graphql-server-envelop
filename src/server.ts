import * as http from "http"; // Node.js built-in HTTP module to create a server
import { envelop, Plugin, useEngine } from "@envelop/core"; // Envelop core functions and Plugin type
import { useValidationCache } from "@envelop/validation-cache"; // Envelop plugin for caching validation results
import * as GraphQL from "graphql"; // GraphQL library
import { schema, root } from "./schema"; // Importing GraphQL schema and resolver root

// ---------------------------
// Context definition
// ---------------------------
// Context is an object that is passed to every resolver
// Here we define a type for TypeScript
interface MyContext {
  req: http.IncomingMessage; // The HTTP request object
  user: { name: string } | null; // Authenticated user info or null if not authenticated
}

// ---------------------------
// Timing plugin
// ---------------------------
// Logs how long a GraphQL request took to execute
const useTiming: Plugin<MyContext> = {
  onExecute({ args }) {
    const start = Date.now(); // record start time
    const operationName = args.operationName || "anonymous"; // get the operation name
    return {
      onExecuteDone() {
        console.log(
          `⏱️ GraphQL [${operationName}] executed in ${Date.now() - start}ms`
        );
      },
    };
  },
};

// ---------------------------
// Logging plugin
// ---------------------------
// Logs incoming requests and errors
const useLogger: Plugin<MyContext> = {
  onExecute({ args }) {
    console.log(
      `➡️ Incoming GraphQL request: ${args.operationName || "anonymous"}`
    );
    return {
      onExecuteDone({ result }) {
        // result may contain errors
        if ((result as any).errors)
          console.error("❌ Errors:", (result as any).errors);
        else console.log("✅ Request executed successfully");
      },
    };
  },
};

// ---------------------------
// Authorization plugin
// ---------------------------
// Checks Authorization header and attaches user info to context
const useAuth: Plugin<MyContext> = {
  onContextBuilding({ context }) {
    // Read Authorization header
    const authHeader = context.req.headers["authorization"];
    // Attach user object if token matches, otherwise null
    (context as any).user =
      authHeader === "Bearer secret-token" ? { name: "Admin" } : null;
  },
  onExecute({ args }) {
    // Throw error if user is not authenticated
    if (!(args.contextValue as any).user) {
      throw new Error("Unauthorized");
    }
  },
};

// ---------------------------
// Initialize Envelop
// ---------------------------
// Envelop is a GraphQL plugin system that wraps execution
// You pass plugins here to modify behavior (logging, auth, etc.)
const getEnveloped = envelop({
  plugins: [
    useEngine(GraphQL), // Register GraphQL execution engine
    useValidationCache(), // Cache validation to improve performance
    useTiming, // Our custom timing plugin
    useLogger, // Our custom logging plugin
    useAuth, // Our custom authorization plugin
  ],
});

// ---------------------------
// GraphiQL UI
// ---------------------------
// A web interface to manually test GraphQL queries
const graphiqlHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Envelop GraphQL</title>
  <link href="https://unpkg.com/graphiql@2.2.0/graphiql.min.css" rel="stylesheet" />
</head>
<body style="margin:0; height:100vh;">
  <div id="graphiql" style="height:100vh;"></div>
  <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/graphiql@2.2.0/graphiql.min.js"></script>
  <script>
    // Fetcher function tells GraphiQL how to send requests
    const fetcher = params => fetch('/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer secret-token'},
      body: JSON.stringify(params)
    }).then(res => res.json());
    ReactDOM.render(React.createElement(GraphiQL, { fetcher }), document.getElementById('graphiql'));
  </script>
</body>
</html>
`;

// ---------------------------
// HTTP server
// ---------------------------
// Handles GET requests for GraphiQL and POST requests for /graphql
const server = http.createServer(async (req, res) => {
  // Serve GraphiQL interface
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(graphiqlHTML);
    return;
  }

  // Handle GraphQL queries
  if (req.method === "POST" && req.url === "/graphql") {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk.toString())); // collect request body
    req.on("end", async () => {
      try {
        // Extract GraphQL query, variables, and operationName
        const { query, variables, operationName } = JSON.parse(body);

        // Get Envelop execution functions and context
        const { execute, parse, contextFactory } = getEnveloped({ req });

        const document = parse(query); // parse query into GraphQL AST

        // Execute GraphQL query with schema, resolvers, variables, context, and operationName
        const result = await execute({
          schema,
          document,
          rootValue: root,
          variableValues: variables,
          contextValue: await contextFactory(),
          operationName,
        });

        // Send JSON response back to client
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (error) {
        // Handle errors
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ errors: [{ message: String(error) }] }));
      }
    });
    return;
  }

  // Return 404 for other routes
  res.writeHead(404);
  res.end("Not Found");
});

// ---------------------------
// Start server
// ---------------------------
server.listen(8080, () =>
  console.log("🚀 Server running at http://localhost:8080/")
);
