import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
// import gradeRoutes from './routes/grade.route';
import schoolRoutes from "./routes/school.route";
import classRoutes from "./routes/class.route";
import subjectRoutes from "./routes/subject.route";
import sessionRoutes from "./routes/session.route";
import termRoutes from "./routes/term.route";
import studentRoutes from "./routes/student.route";
import gradingSettingRoutes from "./routes/grading_setting.route";
import studentScoreRoutes from "./routes/student_score.route";
import resultRoutes from "./routes/result.route";
import classTeacherRoutes from "./routes/class_teacher.route";
import attendanceRoutes from "./routes/attendance.route";
import dashboardRoutes from "./routes/dashboard.route";
import studentResultRoutes from "./routes/student_result.route";
import parentRoutes from "./routes/parent.route";
import messageRoutes from "./routes/message.route";
import superAdminRoutes from "./routes/super_admin.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { applyAssociations } from "./models/associations";

// Apply Sequelize associations
applyAssociations();

const app = express();

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Hello API",
      version: "1.0.0",
      description: "API documentation for the Hello school system",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.ts")],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middlewares
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev")); // Log requests in development
}
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/grades', gradeRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/grading-settings", gradingSettingRoutes);
app.use("/api/student-scores", studentScoreRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/class-teachers", classTeacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/student-results", studentResultRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/superadmin", superAdminRoutes);

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to Hello API!");
});

// 404 Catch-All Middleware
app.use((req, res) => {
  res.status(404).json({
    message: `The API endpoint ${req.originalUrl} does not exist on this server.`,
  });
});

// Error Handling Middleware
app.use(errorMiddleware);

export default app;
