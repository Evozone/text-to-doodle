import express from "express";
import magenta from "./routes/magenta.js";
import user from "./routes/user.js";
import sdk from "node-appwrite";

// Helper packages
import dotenv from "dotenv";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json({ limit: "10MB" }));

app.use("/api/magenta", magenta);
app.use("/api/user", user);

app.get("/", (req, res) => {
  res.send("Hello, welocme to  API!");
});

//Database
const client = new sdk.Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_API_KEY);

export const databases = new sdk.Databases(client);

const server = app.listen(PORT, () =>
  console.log("Hello! This is turtle's backend, listening on port - ", PORT)
);
