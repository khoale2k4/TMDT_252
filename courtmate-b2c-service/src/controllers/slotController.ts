import { Request, Response, NextFunction } from 'express';
import { SlotService } from '../services/slotService';

export class SlotController {
  private slotService = new SlotService();

  public lockSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Ép kiểu 'as string' để dập lỗi 'string | string[]'
      const slotId = req.params.slot_id as string; 
      const userId = (req as any).user.id as string; 
      
      const expectedVersion = req.body.expected_version;
      const lockDurationMinutes = req.body.lock_duration_minutes || 8;

      if (expectedVersion === undefined) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: "Thiếu expected_version." } });
        return;
      }

      // 2. Lúc này truyền vào sẽ không bị lỗi đỏ nữa
      const data = await this.slotService.lockSlot(slotId, userId, expectedVersion, lockDurationMinutes);

      res.status(200).json({
        data,
        message: `Slot đã được giữ chỗ. Vui lòng hoàn thành thanh toán trong ${lockDurationMinutes} phút.`
      });

    } catch (error: any) {
      if (error.status && error.error) {
        res.status(error.status).json({ error: error.error });
      } else {
        next(error); // Đẩy lỗi hệ thống xuống errorHandler
      }
    }
  };
}