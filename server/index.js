import express from "express";
import magenta from "./routes/magenta.js";
// const mongoose = require("mongoose");

// Helper packages
import dotenv from "dotenv";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10MB" }));

app.use("/api/magenta", magenta);
app.get("/", (req, res) => {
  res.send("Hello, welocme to  API!");
});

const server = app.listen(PORT, () =>
  console.log(
    "Hello! This is comfort space's backend, listening on port - ",
    PORT
  )
);
