package pl.aero.fru.dto.operation;

import java.time.OffsetDateTime;

public record CommentResponse(
        Long id,
        String commentText,
        String createdByEmail,
        OffsetDateTime createdAt
) {
}
