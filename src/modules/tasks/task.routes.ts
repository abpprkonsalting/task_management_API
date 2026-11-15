import { Router } from 'express';
import {
  createTaskController,
  listTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from './task.controller';

const router = Router();

router.post('/', createTaskController);
router.get('/', listTasksController);
router.get('/:id', getTaskByIdController);
router.patch('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

export default router;
