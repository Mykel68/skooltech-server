import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import gradeRoutes from "./routes/grade.route";
import schoolRoutes from "./routes/school.route";
import classRoutes from "./routes/class.route";
import subjectRoutes from "./routes/subject.route";
import sessionRoutes from "./routes/session.route";
import termRoutes from "./routes/term.route";
import studentRoutes from "./routes/student.route";
import gradingSettingRoutes from "./routes/grading_setting.route";
import studentScoreRoutes from "./routes/student_score.route";
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
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/grading-settings", gradingSettingRoutes);
app.use("/api/student-scores", studentScoreRoutes);
app.use(errorMiddleware);

// welcome api route
app.get("/", (req, res) => {
  res.send("Welcome to Hello API!");
});

// Catch-All Middleware for 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    message: `The API endpoint ${req.originalUrl} does not exist on this server.`,
  });
});

// Error Handling Middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error(error);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
