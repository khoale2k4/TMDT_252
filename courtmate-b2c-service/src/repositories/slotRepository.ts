import prisma from '../config/prisma';

export class SlotRepository {
  async findById(slotId: string) {
    return prisma.slot.findUnique({
      where: { id: slotId }
    });
  }

  async lockSlot(slotId: string, userId: string, expectedVersion: number, lockedUntil: Date) {
    return prisma.slot.updateMany({
      where: {
        id: slotId,
        version: expectedVersion, 
        status: 'available'       
      },
    data: {
        status: 'locked',
        locked_by: userId,       
        locked_until: lockedUntil, 
    }
    });
  }
}