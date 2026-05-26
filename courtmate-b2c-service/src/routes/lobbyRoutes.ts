import { Router } from 'express';
import { createLobby, getLobbies, joinLobby } from '../controllers/lobbyController';

const router = Router();

router.get('/', getLobbies);
router.post('/', createLobby);
router.post('/:id/join', joinLobby);

export default router;
