package pl.aero.fru.dto.operation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(@NotBlank @Size(max = 500) String commentText) {
}
