import express from 'express';
import swaggerUi from 'swagger-ui-express';
import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';
import { swaggerSpec, swaggerOptions } from './config/swagger';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.get('/api-docs.json', (_req, res) => {
  res.type('application/json').json(swaggerSpec);
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
