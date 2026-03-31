package pl.aero.fru.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private int status;
    private String error;
    private String message;
    private List<FieldError> fieldErrors;
    private List<String> violations;
    private OffsetDateTime timestamp;

    @Getter
    @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
