import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Create a new lobby
export const createLobby = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { venue_id, court_id, slot_id, sport_type, required_level, target_players, total_price } = req.body;
    
    // Calculate split price
    const split_price = Math.ceil(total_price / target_players);

    const lobby = await prisma.lobby.create({
      data: {
        creator_id: userId,
        venue_id,
        court_id,
        slot_id,
        sport_type,
        required_level: required_level || 'Any',
        target_players: target_players || 4,
        current_players: 1, // Creator is the first player
        status: 'waiting',
        total_price,
        split_price,
        members: {
          create: [
            {
              user_id: userId,
              status: 'paid' // Creator usually pays first or commits to pay
            }
          ]
        }
      },
      include: {
        members: true
      }
    });

    return res.status(201).json({ data: lobby });
  } catch (error) {
    console.error('Error creating lobby:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List available lobbies
export const getLobbies = async (req: Request, res: Response) => {
  try {
    const { venue_id, sport_type } = req.query;
    
    // We will just fetch all waiting lobbies for simplicity, but in real app we filter
    // Prisma lt target_players is not directly possible in where without raw query or separate check.
    // For now we just query status = waiting.
    
    const lobbies = await prisma.lobby.findMany({
      where: {
        status: 'waiting',
        ...(venue_id ? { venue_id: venue_id as string } : {}),
        ...(sport_type ? { sport_type: sport_type as string } : {})
      },
      include: {
        members: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Filter lobbies that still need players
    const validLobbies = lobbies.filter(l => l.current_players < l.target_players);

    return res.status(200).json({ data: validLobbies });
  } catch (error) {
    console.error('Error listing lobbies:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Join a lobby
export const joinLobby = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Hardcoded demo joining logic
    const lobby = await prisma.lobby.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
    if (lobby.status !== 'waiting' || lobby.current_players >= lobby.target_players) {
      return res.status(400).json({ error: 'Lobby is full or not waiting' });
    }

    // Check if user already joined
    const alreadyJoined = lobby.members.find(m => m.user_id === userId);
    if (alreadyJoined) {
       return res.status(400).json({ error: 'Already joined this lobby' });
    }

    // Add member
    await prisma.$transaction(async (tx) => {
      await tx.lobbyMember.create({
        data: {
          lobby_id: id,
          user_id: userId,
          status: 'joined' // need to pay next
        }
      });
      
      const updatedLobby = await tx.lobby.update({
        where: { id },
        data: { current_players: { increment: 1 } }
      });

      // If full, we can mark it matched, or wait for everyone to pay
      if (updatedLobby.current_players >= updatedLobby.target_players) {
        await tx.lobby.update({
          where: { id },
          data: { status: 'matched' }
        });
      }
    });

    return res.status(200).json({ message: 'Joined successfully' });
  } catch (error) {
    console.error('Error joining lobby:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
