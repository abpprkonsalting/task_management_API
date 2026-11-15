import express from 'express';
import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';
import { notFound } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.use(notFound);
app.use(errorHandler);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
