package vn.sportscourt.courtmate.b2b.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ── Generic ────────────────────────────────────────────────────────────
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Lỗi hệ thống, vui lòng thử lại.", HttpStatus.INTERNAL_SERVER_ERROR),
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", HttpStatus.BAD_REQUEST),
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.", HttpStatus.FORBIDDEN),
    UNAUTHORIZED("UNAUTHORIZED", "Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED),
    DATABASE_CONSTRAINT_ERROR("DATABASE_CONSTRAINT_ERROR", "Dữ liệu không hợp lệ hoặc đã tồn tại.", HttpStatus.CONFLICT),


    // ── Venue ──────────────────────────────────────────────────────────────
    VENUE_NOT_FOUND("VENUE_NOT_FOUND", "Không tìm thấy sân vận động.", HttpStatus.NOT_FOUND),
    VENUE_INACTIVE("VENUE_INACTIVE", "Sân vận động không hoạt động.", HttpStatus.CONFLICT),
    DUPLICATE_VENUE_NAME("DUPLICATE_VENUE_NAME", "Tên cụm sân này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.", HttpStatus.CONFLICT),

    // ── Court ──────────────────────────────────────────────────────────────
    COURT_NOT_FOUND("COURT_NOT_FOUND", "Không tìm thấy sân.", HttpStatus.NOT_FOUND),
    COURT_NAME_DUPLICATE("COURT_NAME_DUPLICATE", "Tên sân đã tồn tại trong venue này.", HttpStatus.CONFLICT),
    COURT_IN_USE("COURT_IN_USE", "Sân đang có lịch đặt, không thể xóa.", HttpStatus.CONFLICT),
    COURT_HAS_ACTIVE_BOOKINGS("COURT_HAS_ACTIVE_BOOKINGS", "Không thể xóa sân đang có lịch đặt. Vui lòng hủy các booking trước.", HttpStatus.CONFLICT),

    // ── Slot ───────────────────────────────────────────────────────────────
    SLOT_NOT_FOUND("SLOT_NOT_FOUND", "Không tìm thấy slot.", HttpStatus.NOT_FOUND),
    SLOT_UNAVAILABLE("SLOT_UNAVAILABLE", "Slot này đã được đặt.", HttpStatus.CONFLICT),
    SLOT_OVERLAP("SLOT_OVERLAP", "Slot mới bị trùng giờ với slot khác.", HttpStatus.CONFLICT),
    SLOT_LOCKED("SLOT_LOCKED", "Slot đang bị khóa bởi giao dịch khác.", HttpStatus.CONFLICT),
    SLOT_VERSION_CONFLICT("SLOT_VERSION_CONFLICT", "Slot vừa bị cập nhật bởi người khác. Vui lòng tải lại lịch.", HttpStatus.CONFLICT),
    SLOTS_ALREADY_EXIST("SLOTS_ALREADY_EXIST", "Đã có slot tồn tại trong khoảng thời gian này.", HttpStatus.CONFLICT),

    // ── Booking ────────────────────────────────────────────────────────────
    BOOKING_NOT_FOUND("BOOKING_NOT_FOUND", "Không tìm thấy đơn đặt sân.", HttpStatus.NOT_FOUND),
    BOOKING_INVALID_TRANSITION("BOOKING_INVALID_TRANSITION", "Chuyển trạng thái không hợp lệ.", HttpStatus.UNPROCESSABLE_ENTITY),
    BOOKING_ALREADY_CANCELLED("BOOKING_ALREADY_CANCELLED", "Đơn đặt sân đã bị huỷ.", HttpStatus.CONFLICT),
    BOOKING_ALREADY_COMPLETED("BOOKING_ALREADY_COMPLETED", "Đơn đặt sân đã hoàn thành.", HttpStatus.CONFLICT),
    BOOKING_NOT_CONFIRMED("BOOKING_NOT_CONFIRMED", "Đơn chưa được xác nhận để check-in.", HttpStatus.CONFLICT),

    // ── Invoice ────────────────────────────────────────────────────────────
    INVOICE_NOT_FOUND("INVOICE_NOT_FOUND", "Không tìm thấy hoá đơn.", HttpStatus.NOT_FOUND),
    INVOICE_ALREADY_ISSUED("INVOICE_ALREADY_ISSUED", "Hoá đơn đã được phát hành.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
