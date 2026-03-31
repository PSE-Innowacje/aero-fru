package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.aero.fru.dto.crew.CrewMemberListResponse;
import pl.aero.fru.dto.crew.CrewMemberRequest;
import pl.aero.fru.dto.crew.CrewMemberResponse;
import pl.aero.fru.service.CrewMemberService;

import java.util.List;

@RestController
@RequestMapping("/api/crew-members")
@RequiredArgsConstructor
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    @GetMapping
    public ResponseEntity<List<CrewMemberListResponse>> findAll() {
        return ResponseEntity.ok(crewMemberService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(crewMemberService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CrewMemberResponse> create(@Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(crewMemberService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrewMemberResponse> update(@PathVariable Long id, @Valid @RequestBody CrewMemberRequest request) {
        return ResponseEntity.ok(crewMemberService.update(id, request));
    }
}
