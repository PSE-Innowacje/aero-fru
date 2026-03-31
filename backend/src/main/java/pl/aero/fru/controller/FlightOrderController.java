package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pl.aero.fru.dto.flightorder.*;
import pl.aero.fru.security.UserPrincipal;
import pl.aero.fru.service.FlightOrderService;

@RestController
@RequestMapping("/api/flight-orders")
@RequiredArgsConstructor
public class FlightOrderController {

    private final FlightOrderService flightOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('Osoba nadzorująca', 'Pilot', 'Administrator')")
    public ResponseEntity<Page<FlightOrderListResponse>> findAll(
            @RequestParam(required = false, defaultValue = "2") Long statusId,
            Pageable pageable) {
        return ResponseEntity.ok(flightOrderService.findAll(statusId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Osoba nadzorująca', 'Pilot', 'Administrator')")
    public ResponseEntity<FlightOrderResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(flightOrderService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Pilot')")
    public ResponseEntity<FlightOrderResponse> create(
            @Valid @RequestBody FlightOrderCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(flightOrderService.create(request, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Pilot', 'Osoba nadzorująca')")
    public ResponseEntity<FlightOrderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FlightOrderUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(flightOrderService.update(id, request, principal));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('Pilot', 'Osoba nadzorująca')")
    public ResponseEntity<FlightOrderResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody FlightOrderStatusChangeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(flightOrderService.changeStatus(id, request, principal));
    }
}
