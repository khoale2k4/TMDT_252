import { SlotRepository } from '../repositories/slotRepository';
import crypto from 'crypto';

export class SlotService {
  private slotRepository = new SlotRepository();

  public async lockSlot(slotId: string, userId: string, expectedVersion: number, lockDurationMinutes: number) {
    const slot = await this.slotRepository.findById(slotId);

    if (!slot) {
      throw { status: 404, error: { code: "SLOT_NOT_FOUND", message: "Slot không tồn tại." } };
    }

    if (slot.version !== expectedVersion) {
      throw {
        status: 409,
        error: {
          code: "SLOT_VERSION_CONFLICT",
          message: "Slot vừa bị cập nhật bởi người khác. Vui lòng tải lại lịch.",
          details: { current_version: slot.version, your_version: expectedVersion }
        }
      };
    }

    if (slot.status !== 'available') {
      throw { status: 410, error: { code: "SLOT_UNAVAILABLE", message: "Slot này đã được đặt." } };
    }

    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + lockDurationMinutes);
    const lockToken = `lk_${crypto.randomBytes(5).toString('hex')}`;

    const updateResult = await this.slotRepository.lockSlot(slotId, userId, expectedVersion, lockedUntil, lockToken);

    if (updateResult.count === 0) {
      const currentSlot = await this.slotRepository.findById(slotId);
      throw {
        status: 409,
        error: {
          code: "SLOT_VERSION_CONFLICT",
          message: "Slot vừa bị cập nhật bởi người khác. Vui lòng tải lại lịch.",
          details: { current_version: currentSlot?.version || expectedVersion + 1, your_version: expectedVersion }
        }
      };
    }

    const updatedSlot = await this.slotRepository.findById(slotId);

   return {
      lock_token: lockToken,
      slot_id: updatedSlot!.id,
      locked_until: updatedSlot!.locked_until, 
      new_version: updatedSlot!.version,
      slot_details: {
        court_id: updatedSlot!.court_id,
        date: updatedSlot!.date,              // (VD: "2026-04-10")
        start_time: updatedSlot!.start_time, 
        end_time: updatedSlot!.end_time,     
        price: updatedSlot!.price
      }
    };
  }
}