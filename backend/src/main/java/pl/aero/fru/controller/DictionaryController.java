package pl.aero.fru.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.aero.fru.dto.dictionary.DictionaryResponse;
import pl.aero.fru.service.DictionaryService;

import java.util.List;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/crew-roles")
    public ResponseEntity<List<DictionaryResponse>> getCrewRoles() {
        return ResponseEntity.ok(dictionaryService.getCrewRoles());
    }

    @GetMapping("/user-roles")
    public ResponseEntity<List<DictionaryResponse>> getUserRoles() {
        return ResponseEntity.ok(dictionaryService.getUserRoles());
    }

    @GetMapping("/activity-types")
    public ResponseEntity<List<DictionaryResponse>> getActivityTypes() {
        return ResponseEntity.ok(dictionaryService.getActivityTypes());
    }

    @GetMapping("/operation-statuses")
    public ResponseEntity<List<DictionaryResponse>> getOperationStatuses() {
        return ResponseEntity.ok(dictionaryService.getOperationStatuses());
    }

    @GetMapping("/flight-order-statuses")
    public ResponseEntity<List<DictionaryResponse>> getFlightOrderStatuses() {
        return ResponseEntity.ok(dictionaryService.getFlightOrderStatuses());
    }
}
