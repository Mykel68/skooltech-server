import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import gradeRoutes from "./routes/grade.routes";
import schoolRoutes from "./routes/school.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Hello API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/grades", gradeRoutes);
app.use("/schools", schoolRoutes);
app.use(errorMiddleware);

export default app;
