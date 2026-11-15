import express from 'express';
import userRoutes from './modules/users/user.routes';
import taskRoutes from './modules/tasks/task.routes';

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
