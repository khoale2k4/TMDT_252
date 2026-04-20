package vn.sportscourt.courtmate.b2b.exception;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        log.warn("AppException: [{}] {}", ex.getCode(), ex.getMessage());
        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(ErrorResponse.of(ex.getCode(), ex.getMessage(), ex.getDetails()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(
                        ErrorCode.VALIDATION_ERROR.getCode(),
                        ErrorCode.VALIDATION_ERROR.getMessage(),
                        fieldErrors
                ));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        log.warn("Optimistic lock conflict: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ErrorResponse.of(
                        ErrorCode.SLOT_LOCKED.getCode(),
                        ErrorCode.SLOT_LOCKED.getMessage(),
                        null
                ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String root_message = ex.getMostSpecificCause().getMessage();

        Map<String, Object> error_block = new HashMap<>();
        Map<String, Object> response_body = new HashMap<>();

        if (root_message != null && root_message.contains("venues_slug_key")) {
            error_block.put("code", ErrorCode.DUPLICATE_VENUE_NAME.name());
            error_block.put("message", ErrorCode.DUPLICATE_VENUE_NAME.getMessage());

            Map<String, String> details = new HashMap<>();
            details.put("name", "Đã tồn tại đường dẫn (slug) cho tên sân này.");
            error_block.put("details", details);
        }
        else {
            error_block.put("code", ErrorCode.DATABASE_CONSTRAINT_ERROR.name());
            error_block.put("message", ErrorCode.DATABASE_CONSTRAINT_ERROR.getMessage());
            error_block.put("details", new HashMap<>());
        }

        response_body.put("error", error_block);

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response_body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        String fieldName = "dữ_liệu";
        String invalidValue = "không xác định";

        if (ex.getCause() instanceof InvalidFormatException ife) {
            if (!ife.getPath().isEmpty()) {
                fieldName = ife.getPath().get(0).getFieldName();
            }
            if (ife.getValue() != null) {
                invalidValue = ife.getValue().toString();
            }
        }

        Map<String, Object> errorBody = Map.of(
                "error", Map.of(
                        "code", "VALIDATION_ERROR",
                        "message", "Dữ liệu không hợp lệ.",
                        "details", Map.of(
                                fieldName, "Giá trị không hợp lệ: " + invalidValue
                        )
                )
        );

        return ResponseEntity.badRequest().body(errorBody);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGeneralException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", "Internal Server Error");
        body.put("details", ex.getMessage());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("message", ex.getMessage());
        body.put("status", HttpStatus.BAD_REQUEST.value());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    public record ErrorResponse(ErrorBody error) {
        public static ErrorResponse of(String code, String message, Object details) {
            return new ErrorResponse(new ErrorBody(code, message, details != null ? details : Map.of()));
        }

        public record ErrorBody(String code, String message, Object details) {}
    }
}
