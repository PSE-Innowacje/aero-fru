package pl.aero.fru.dto.flightorder;

import jakarta.validation.constraints.NotNull;

public record FlightOrderStatusChangeRequest(@NotNull Long statusId) {
}
