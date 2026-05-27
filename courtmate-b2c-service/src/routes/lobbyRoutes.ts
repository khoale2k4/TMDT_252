import { Router } from 'express';
import { createLobby, getLobbies, joinLobby } from '../controllers/lobbyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getLobbies);
router.post('/', authMiddleware, createLobby);
router.post('/:id/join', authMiddleware, joinLobby);

export default router;
