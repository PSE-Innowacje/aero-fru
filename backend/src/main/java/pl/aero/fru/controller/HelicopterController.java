package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.aero.fru.dto.helicopter.HelicopterListResponse;
import pl.aero.fru.dto.helicopter.HelicopterRequest;
import pl.aero.fru.dto.helicopter.HelicopterResponse;
import pl.aero.fru.service.HelicopterService;

import java.util.List;

@RestController
@RequestMapping("/api/helicopters")
@RequiredArgsConstructor
public class HelicopterController {

    private final HelicopterService helicopterService;

    @GetMapping
    public ResponseEntity<List<HelicopterListResponse>> findAll() {
        return ResponseEntity.ok(helicopterService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HelicopterResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(helicopterService.findById(id));
    }

    @PostMapping
    public ResponseEntity<HelicopterResponse> create(@Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(helicopterService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HelicopterResponse> update(@PathVariable Long id, @Valid @RequestBody HelicopterRequest request) {
        return ResponseEntity.ok(helicopterService.update(id, request));
    }
}
