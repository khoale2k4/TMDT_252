import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Mock user ID for B2C Demo
const MOCK_USER_ID = "user-123";

export const getProfileStats = async (req: Request, res: Response) => {
  try {
    let stat = await prisma.userStat.findUnique({
      where: { user_id: MOCK_USER_ID }
    });

    if (!stat) {
      stat = await prisma.userStat.create({
        data: {
          user_id: MOCK_USER_ID,
          elo_rating: 1450,
          total_matches: 42,
          level: "Intermediate",
          milestones: ["first_blood", "10_matches", "weekend_warrior"]
        }
      });
    }

    // Generate mock radar stats
    const radarData = [
      { subject: 'Power', A: 80, fullMark: 100 },
      { subject: 'Speed', A: 65, fullMark: 100 },
      { subject: 'Stamina', A: 90, fullMark: 100 },
      { subject: 'Technique', A: 75, fullMark: 100 },
      { subject: 'Mental', A: 85, fullMark: 100 },
      { subject: 'Teamwork', A: 70, fullMark: 100 },
    ];

    return res.status(200).json({
      data: {
        ...stat,
        radar_stats: radarData
      }
    });
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getActivityTracker = async (req: Request, res: Response) => {
  try {
    let activities = await prisma.userActivity.findMany({
      where: { user_id: MOCK_USER_ID },
      orderBy: { date: 'asc' }
    });

    if (activities.length === 0) {
      // Seed some mock activity for the last 6 months
      const mockActivities = [];
      const today = new Date();
      for (let i = 180; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Randomly assign matches
        if (Math.random() > 0.6) {
          mockActivities.push({
            user_id: MOCK_USER_ID,
            date: d.toISOString().split('T')[0],
            matches: Math.floor(Math.random() * 3) + 1,
            check_ins: 1
          });
        }
      }
      
      await prisma.userActivity.createMany({
        data: mockActivities
      });

      activities = await prisma.userActivity.findMany({
        where: { user_id: MOCK_USER_ID },
        orderBy: { date: 'asc' }
      });
    }

    return res.status(200).json({
      data: activities
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
