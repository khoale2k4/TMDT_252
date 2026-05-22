package vn.sportscourt.courtmate.b2b.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final String code;
    private final HttpStatus httpStatus;
    private final Object details;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.httpStatus = errorCode.getHttpStatus();
        this.details = null;
    }

    public AppException(ErrorCode errorCode, Object details) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.httpStatus = errorCode.getHttpStatus();
        this.details = details;
    }
}
