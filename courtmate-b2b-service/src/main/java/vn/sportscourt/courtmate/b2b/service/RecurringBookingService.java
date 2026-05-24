package vn.sportscourt.courtmate.b2b.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.sportscourt.courtmate.b2b.entity.Booking;
import vn.sportscourt.courtmate.b2b.entity.Slot;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.SlotRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecurringBookingService {
    
    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;

    /**
     * Thuật toán kiểm tra và khóa lịch dài hạn (Recurring Booking)
     * @param venueId ID của cơ sở thể thao
     * @param courtId ID của sân cụ thể
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @param dayOfWeek Ngày trong tuần (1=Monday...7=Sunday)
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return List các Slot hợp lệ nếu tất cả đều trống, throw Exception nếu có conflict.
     */
    public List<Slot> validateAndLockRecurringSlots(UUID venueId, UUID courtId, LocalDate startDate, LocalDate endDate, int dayOfWeek, String startTime, String endTime) {
        List<Slot> requiredSlots = new ArrayList<>();
        
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (current.getDayOfWeek().getValue() == dayOfWeek) {
                // Find slot
                List<Slot> slots = slotRepository.findByCourtIdAndDateAndStartTimeAndEndTime(courtId, current, java.time.LocalTime.parse(startTime), java.time.LocalTime.parse(endTime));
                if (slots.isEmpty() || slots.get(0).getStatus() != SlotStatus.available) {
                    throw new RuntimeException("Conflict detected on date: " + current + ". Vui lòng chọn lịch khác hoặc bỏ qua ngày này.");
                }
                requiredSlots.add(slots.get(0));
            }
            current = current.plusDays(1);
        }

        // Lock all slots
        UUID recurringGroupId = UUID.randomUUID();
        for (Slot slot : requiredSlots) {
            slot.setStatus(SlotStatus.locked);
            // Set lock TTL here if needed
        }
        slotRepository.saveAll(requiredSlots);

        return requiredSlots;
    }
}
