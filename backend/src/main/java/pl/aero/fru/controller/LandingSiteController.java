package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.aero.fru.dto.landingsite.LandingSiteRequest;
import pl.aero.fru.dto.landingsite.LandingSiteResponse;
import pl.aero.fru.service.LandingSiteService;

import java.util.List;

@RestController
@RequestMapping("/api/landing-sites")
@RequiredArgsConstructor
public class LandingSiteController {

    private final LandingSiteService landingSiteService;

    @GetMapping
    public ResponseEntity<List<LandingSiteResponse>> findAll() {
        return ResponseEntity.ok(landingSiteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(landingSiteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LandingSiteResponse> create(@Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(landingSiteService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandingSiteResponse> update(@PathVariable Long id, @Valid @RequestBody LandingSiteRequest request) {
        return ResponseEntity.ok(landingSiteService.update(id, request));
    }
}
