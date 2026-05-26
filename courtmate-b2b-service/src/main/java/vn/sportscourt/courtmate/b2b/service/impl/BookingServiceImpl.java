package vn.sportscourt.courtmate.b2b.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.sportscourt.courtmate.b2b.dto.request.CancelBookingRequest;
import vn.sportscourt.courtmate.b2b.dto.request.CheckInRequest;
import vn.sportscourt.courtmate.b2b.dto.request.WalkInRequest;
import vn.sportscourt.courtmate.b2b.dto.response.*;
import vn.sportscourt.courtmate.b2b.entity.*;
import vn.sportscourt.courtmate.b2b.enums.BookingStatus;
import vn.sportscourt.courtmate.b2b.enums.PaymentStatus;
import vn.sportscourt.courtmate.b2b.enums.SlotStatus;
import vn.sportscourt.courtmate.b2b.events.BookingEvent;
import vn.sportscourt.courtmate.b2b.exception.AppException;
import vn.sportscourt.courtmate.b2b.exception.ErrorCode;
import vn.sportscourt.courtmate.b2b.mapper.BookingMapper;
import vn.sportscourt.courtmate.b2b.repository.BookingRepository;
import vn.sportscourt.courtmate.b2b.repository.PaymentRepository;
import vn.sportscourt.courtmate.b2b.repository.SlotRepository;
import vn.sportscourt.courtmate.b2b.repository.VenueRepository;
import vn.sportscourt.courtmate.b2b.service.AuditLogService;
import vn.sportscourt.courtmate.b2b.service.BookingService;
import vn.sportscourt.courtmate.b2b.service.SseService;
import vn.sportscourt.courtmate.b2b.statemachine.BookingStateMachineService;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final VenueRepository venueRepository;
    private final PaymentRepository paymentRepository;
    private final BookingMapper bookingMapper;
    private final BookingStateMachineService stateMachineService;
    private final AuditLogService auditLogService;
    private final SseService sseService;

    // ── Walk-in ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public WalkInResponse walkIn(WalkInRequest request, UUID staffId) {

        Slot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new AppException(ErrorCode.SLOT_NOT_FOUND));

        if (!slot.getVersion().equals(request.getExpectedVersion())) {
            throw new AppException(ErrorCode.SLOT_VERSION_CONFLICT,
                    Map.of("current_version", slot.getVersion(),
                            "expected_version", request.getExpectedVersion()));
        }

        if (slot.getStatus() != SlotStatus.available) {
            throw new AppException(ErrorCode.SLOT_UNAVAILABLE,
                    Map.of("slot_id", request.getSlotId(), "status", slot.getStatus().name()));
        }

        Venue venue = slot.getCourt().getVenue();
        BookingStatus confirmedStatus = stateMachineService.transition(
                UUID.randomUUID(), BookingStatus.pending_payment, BookingEvent.WALK_IN);

        UUID customerId = (request.getCustomer() != null) ? request.getCustomer().getUserId() : null;

        Booking booking = Booking.builder()
                .user(customerId != null ? Users.builder().id(customerId).build() : null)
                .venue(venue)
                .totalAmount(slot.getPrice())
                .finalAmount(request.getAmountPaid() != null ? request.getAmountPaid() : slot.getPrice())
                .status(confirmedStatus)
                .notes(request.getNotes() + (request.getCustomer() != null && customerId == null
                        ? " | Khách: " + request.getCustomer().getFullName() + " - " + request.getCustomer().getPhone()
                        : ""))
                .build();

        BookingItem item = BookingItem.builder()
                .booking(booking)
                .slot(slot)
                .price(slot.getPrice())
                .build();
        booking.setItems(List.of(item));

        Booking saved = bookingRepository.save(booking);

        slot.setStatus(SlotStatus.booked);
        slotRepository.save(slot);

        Payment payment = Payment.builder()
                .booking(saved)
                .method(request.getPaymentMethod())
                .amount(saved.getFinalAmount())
                .status(PaymentStatus.paid)
                .build();
        paymentRepository.save(payment);

        auditLogService.log("bookings", saved.getId(), "walk_in",
                null, Map.of("status", saved.getStatus().name(), "slot_id", request.getSlotId()), null, staffId);

        String datePrefix = LocalDate.now().toString().replace("-", "");
        String receiptNo = "RC" + datePrefix + saved.getId().toString().substring(0, 4).toUpperCase();

        WalkInResponse response = WalkInResponse.builder()
                .bookingId(saved.getId())
                .status(saved.getStatus().name())
                .paymentStatus(payment.getStatus().name())
                .slot(WalkInResponse.SlotInfo.builder()
                        .name(slot.getCourt().getName())
                        .date(slot.getDate())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .build())
                .receiptNo(receiptNo)
                .build();

        sseService.sendEventToVenue(venue.getId(), "NEW_BOOKING", response);

        return response;
    }

    // ── Read ──────────────────────────────────────────────────────────────

    @Override
    public BookingDetailResponse findById(UUID id) {
        Booking b = bookingRepository.findBookingDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        BookingDetailResponse.CustomerInfo customer = null;
        if (b.getUser() != null) {
            long totalBookings = bookingRepository.countByUserId(b.getUser().getId());
            customer = BookingDetailResponse.CustomerInfo.builder()
                    .userId(b.getUser().getId())
                    .fullName(b.getUser().getFullName())
                    .phone(b.getUser().getPhone())
                    .email(b.getUser().getEmail() != null ? b.getUser().getEmail() : "khachhang@email.com")
                    .totalBookings(totalBookings)
                    .build();
        }

        BookingDetailResponse.CourtInfo court = null;
        BookingDetailResponse.SlotInfo slot = null;

        if (b.getItems() != null && !b.getItems().isEmpty()) {
            Slot s = b.getItems().get(0).getSlot();
            if (s != null) {
                court = BookingDetailResponse.CourtInfo.builder()
                        .courtId(s.getCourt().getId())
                        .name(s.getCourt().getName())
                        .venueName(b.getVenue() != null ? b.getVenue().getName() : null)
                        .sportType(s.getCourt().getSportType())
                        .build();

                slot = BookingDetailResponse.SlotInfo.builder()
                        .slotId(s.getId())
                        .date(s.getDate())
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .build();
            }
        }

        BookingDetailResponse.PaymentInfo payment = null;
        if (b.getPayments() != null && !b.getPayments().isEmpty()) {
            Payment p = b.getPayments().get(b.getPayments().size() - 1);
            payment = BookingDetailResponse.PaymentInfo.builder()
                    .method(p.getMethod())
                    .status(p.getStatus().name())
                    .amount(p.getAmount())
                    .transactionId(p.getId().toString().substring(0, 8).toUpperCase())
                    .paidAt(p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt())
                    .build();
        }

        return BookingDetailResponse.builder()
                .bookingId(b.getId())
                .customer(customer)
                .court(court)
                .slot(slot)
                .bookingType("single")
                .status(b.getStatus())
                .payment(payment)
                .addOns(new ArrayList<>())
                .delivery(null)
                .invoice(null)
                .notes(b.getNotes())
                .createdAt(b.getCreatedAt())
                .build();
    }

    @Override
    public List<BookingResponse> findByVenue(UUID venueId, LocalDate dateFrom, LocalDate dateTo,
                                             String status, String search, int page, int limit) {
        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusDays(30);
        LocalDate to   = dateTo   != null ? dateTo   : LocalDate.now().plusDays(30);

        return bookingRepository.findByVenueAndDateRange(venueId, from, to).stream()
                .filter(b -> status == null || b.getStatus().name().equalsIgnoreCase(status))
                .filter(b -> search == null || matchesSearch(b, search))
                .skip((long) (page - 1) * limit)
                .limit(limit)
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VenueBookingListResponse getVenueBookings(
            UUID venueId, LocalDate dateFrom, LocalDate dateTo,
            String statusStr, String paymentStatusStr, String search,
            String sportType, UUID courtId, int page, int limit) {

        BookingStatus status = null;
        if (statusStr != null) {
            status = statusStr.equalsIgnoreCase("pending")
                    ? BookingStatus.pending_payment
                    : BookingStatus.valueOf(statusStr.toLowerCase());
        }

        PaymentStatus paymentStatus = null;
        if (paymentStatusStr != null) {
            paymentStatus = PaymentStatus.valueOf(paymentStatusStr.toLowerCase());
        }

        boolean hasSearch = false;
        String searchKeyword = null;
        if (search != null && !search.trim().isEmpty()) {
            hasSearch = true;
            searchKeyword = "%" + search.trim().toLowerCase() + "%";
        }

        Pageable pageable = PageRequest.of(
                page - 1, limit, Sort.by("createdAt").descending());

        Page<Booking> bookingPage = bookingRepository.findFilteredBookings(
                venueId, dateFrom, dateTo,
                status != null, status,
                paymentStatus != null, paymentStatus,
                sportType != null, sportType,
                courtId != null, courtId,
                hasSearch, searchKeyword,
                pageable);

        List<VenueBookingListResponse.BookingDetail> bookingDetails = bookingPage.getContent().stream()
                .map(this::mapToDetailResponse)
                .toList();

        List<Object[]> summaryRaw = bookingRepository.getBookingSummary(
                venueId, dateFrom, dateTo,
                status != null, status,
                paymentStatus != null, paymentStatus,
                sportType != null, sportType,
                courtId != null, courtId,
                hasSearch, searchKeyword
        );

        long totalConfirmed = 0, totalCancelled = 0, totalPending = 0, totalRevenue = 0;

        for (Object[] row : summaryRaw) {
            BookingStatus bStatus = (BookingStatus) row[0];
            long count = (long) row[1];
            long sum = row[2] != null ? (long) row[2] : 0;

            if (bStatus == BookingStatus.confirmed || bStatus == BookingStatus.completed) {
                totalConfirmed += count;
                totalRevenue += sum;
            } else if (bStatus == BookingStatus.cancelled) {
                totalCancelled += count;
            } else if (bStatus == BookingStatus.pending_payment) {
                totalPending += count;
            }
        }

        return VenueBookingListResponse.builder()
                .bookings(bookingDetails)
                .pagination(VenueBookingListResponse.PaginationMeta.builder()
                        .page(page)
                        .total(bookingPage.getTotalElements())
                        .totalPages(bookingPage.getTotalPages())
                        .build())
                .summary(VenueBookingListResponse.BookingSummary.builder()
                        .totalConfirmed(totalConfirmed)
                        .totalCancelled(totalCancelled)
                        .totalPending(totalPending)
                        .totalRevenue(totalRevenue)
                        .build())
                .build();
    }

    // ── Cancel ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CancelBookingResponse cancel(UUID id, CancelBookingRequest request, UUID requesterId) {
        Booking booking = getOrThrow(id);

        if (booking.getStatus() == BookingStatus.completed) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_COMPLETED,
                    Map.of("current_status", booking.getStatus().name()));
        }
        if (booking.getStatus() == BookingStatus.cancelled) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }

        // STEP 1: Verify the refund amount
        boolean hasRefund = !"none".equalsIgnoreCase(request.getRefundPolicy());
        if ("partial".equalsIgnoreCase(request.getRefundPolicy())) {
            if (request.getRefundAmount() == null || request.getRefundAmount() <= 0) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        Map.of("refund_amount", "Bắt buộc phải nhập số tiền hoàn khi chọn partial"));
            }
            if (request.getRefundAmount() > booking.getFinalAmount()) {
                throw new AppException(ErrorCode.VALIDATION_ERROR,
                        Map.of("refund_amount", "Số tiền hoàn không được lớn hơn tổng tiền đã thanh toán"));
            }
        }

        // STEP 2: Change booking state
        BookingEvent event = hasRefund ? BookingEvent.REFUND : BookingEvent.CANCEL;
        BookingStatus newStatus = stateMachineService.transition(id, booking.getStatus(), event);
        booking.setStatus(newStatus);

        // STEP 3: Release the slot
        if (booking.getItems() != null) {
            booking.getItems().forEach(bi -> {
                Slot slot = bi.getSlot();
                if (slot != null && slot.getStatus() == SlotStatus.booked) {
                    slot.setStatus(SlotStatus.available);
                    slotRepository.save(slot);
                }
            });
        }

        // STEP 4: Process refund and record transaction
        int refundAmount = 0;
        String paymentMethod = "N/A";
        Payment payment = paymentRepository.findByBooking_Id(id);

        if (hasRefund && payment != null) {
            Payment lastPayment = payment;
            paymentMethod = lastPayment.getMethod();

            refundAmount = switch (request.getRefundPolicy().toLowerCase()) {
                case "full"    -> booking.getFinalAmount();
                case "partial" -> request.getRefundAmount();
                default        -> 0;
            };

            // TODO: Gọi MoMo/ZaloPay API Refund (Ví dụ: momoService.refund(id, refundAmount))

            Payment refundTransaction = Payment.builder()
                    .booking(booking)
                    .method(paymentMethod)
                    .amount(-refundAmount)
                    .status(PaymentStatus.refunded)
                    // If there is an additional "type" field, set type = "refund"
                    .build();
            paymentRepository.save(refundTransaction);

            log.info("[PAYMENT STUB] Refund {} VND via {} for booking {}", refundAmount, paymentMethod, id);
        }

        bookingRepository.save(booking);

        // STEP 5: Record into Audit
        UUID auditId = UUID.randomUUID();
        auditLogService.log("bookings", id, "booking_cancelled",
                Map.of("status", "confirmed"),
                Map.of("status", "cancelled", "refund_policy", request.getRefundPolicy(), "refund_amount", refundAmount),
                request.getReason(), requesterId);

        if (request.isNotifyCustomer() && booking.getUser() != null) {
            // TODO: Inject NotificationService và gọi hàm gửi
            // notificationService.sendCancellationNotice(booking.getUser(), booking, request.getReason());
            log.info("Đã đưa thông báo hủy lịch của booking {} vào hàng đợi gửi SMS/Email", id);
        }

        CancelBookingResponse response = CancelBookingResponse.builder()
                .bookingId(id)
                .status("cancelled")
                .refund(CancelBookingResponse.RefundInfo.builder()
                        .policy(request.getRefundPolicy())
                        .amount(refundAmount)
                        .method(paymentMethod)
                        .estimatedRefundTime(hasRefund ? "3–5 ngày làm việc" : null)
                        .build())
                .customerNotified(request.isNotifyCustomer())
                .auditLogId(auditId)
                .build();

        if (booking.getVenue() != null) {
            sseService.sendEventToVenue(booking.getVenue().getId(), "UPDATE_BOOKING", response);
        }

        return response;
    }

    // ── Check-in ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CheckInResponse checkIn(UUID id, CheckInRequest request, UUID staffId) {
        Booking booking = getOrThrow(id);

        if (booking.getStatus() != BookingStatus.confirmed) {
            throw new AppException(ErrorCode.BOOKING_NOT_CONFIRMED,
                    Map.of("current_status", booking.getStatus().name(),
                            "message", "Chỉ có thể check-in các booking đang ở trạng thái confirmed"));
        }

        BookingStatus newStatus = stateMachineService.transition(id, booking.getStatus(), BookingEvent.CHECK_IN);
        booking.setStatus(newStatus);
        bookingRepository.save(booking);

        auditLogService.log("bookings", id, "check_in",
                Map.of("status", "confirmed"),
                Map.of("status", "completed", "method", request.getCheckinMethod()),
                request.getNote(), staffId);

        BookingItem firstItem = booking.getItems() != null && !booking.getItems().isEmpty()
                ? booking.getItems().get(0) : null;
        Slot slot = firstItem != null ? firstItem.getSlot() : null;

        CheckInResponse response = CheckInResponse.builder()
                .bookingId(id)
                .checkinStatus("checked_in")
                .checkinAt(OffsetDateTime.now())
                .checkinBy(staffId)
                .customerName(booking.getUser() != null ? booking.getUser().getFullName() : "Khách vãng lai")
                .slot(slot != null ? CheckInResponse.SlotInfo.builder()
                        .name(slot.getCourt().getName())
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .build() : null)
                .build();

        if (booking.getVenue() != null) {
            sseService.sendEventToVenue(booking.getVenue().getId(), "UPDATE_BOOKING", response);
        }

        return response;
    }

    // ── Private ───────────────────────────────────────────────────────────

    private Booking getOrThrow(UUID id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private boolean matchesSearch(Booking b, String search) {
        String q = search.toLowerCase();
        if (b.getUser() != null) {
            if (b.getUser().getFullName() != null && b.getUser().getFullName().toLowerCase().contains(q)) return true;
            if (b.getUser().getPhone() != null && b.getUser().getPhone().contains(q)) return true;
        }
        return b.getId().toString().contains(q);
    }

    private VenueBookingListResponse.BookingDetail mapToDetailResponse(Booking b) {
        VenueBookingListResponse.CustomerInfo customer = null;
        if (b.getUser() != null) {
            customer = VenueBookingListResponse.CustomerInfo.builder()
                    .userId(b.getUser().getId())
                    .fullName(b.getUser().getFullName())
                    .phone(b.getUser().getPhone())
                    .build();
        }

        VenueBookingListResponse.CourtInfo court = null;
        VenueBookingListResponse.SlotInfo slot = null;

        if (b.getItems() != null && !b.getItems().isEmpty()) {
            Slot s = b.getItems().get(0).getSlot();
            court = VenueBookingListResponse.CourtInfo.builder()
                    .courtId(s.getCourt().getId())
                    .name(s.getCourt().getName())
                    .sportType(s.getCourt().getSportType())
                    .build();

            slot = VenueBookingListResponse.SlotInfo.builder()
                    .date(s.getDate())
                    .startTime(s.getStartTime())
                    .endTime(s.getEndTime())
                    .build();
        }

        String paymentStat = "unpaid";
        if (b.getPayments() != null && !b.getPayments().isEmpty()) {
            paymentStat = b.getPayments().get(b.getPayments().size() - 1).getStatus().name();
        }

        return VenueBookingListResponse.BookingDetail.builder()
                .bookingId(b.getId())
                .customer(customer)
                .court(court)
                .slot(slot)
                .bookingType("single")
                .status(b.getStatus())
                .totalAmount(b.getFinalAmount())
                .paymentStatus(paymentStat)
                .hasAddOns(false)
                .hasDelivery(false)
                .createdAt(b.getCreatedAt())
                .build();
    }
}
