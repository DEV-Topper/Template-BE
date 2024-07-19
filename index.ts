import cors from "cors";
import { config } from "dotenv";
import express, { Application, json } from "express";
import { mainApp } from "./mainApp";
import { dbConfig } from "./utils/dbConfig";
import { port } from "./utils/constant";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

config();

const app: Application = express();

app.use(json());
app.use(cors());

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Documentation",
      version: "1.0.0",
      description: "API documentation for your application",
    },
  },
  apis: ["./routers/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mainApp(app);

const server = app.listen(port, () => {
  console.clear();
  dbConfig();
  console.log(`Server is running on port ${port}`);
});

process
  .on("uncaughtException", (error: Error) => {
    console.log("error: ", error);
    process.exit(1);
  })
  .on("unhandledRejection", (reason: unknown) => {
    console.log("reason: ", reason);
    server.close(() => {
      process.exit(1);
    });
  });
