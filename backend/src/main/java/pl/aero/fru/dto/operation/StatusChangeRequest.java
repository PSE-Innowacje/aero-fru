package pl.aero.fru.dto.operation;

import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(@NotNull Long statusId) {
}
