import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import gradeRoutes from './routes/grade.route';
import { errorMiddleware } from './middlewares/error.middleware';
const app = express();
app.use(express.json());
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Hello API', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/grades', gradeRoutes);
app.use(errorMiddleware);
export default app;
