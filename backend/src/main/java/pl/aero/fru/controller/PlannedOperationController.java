package pl.aero.fru.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.aero.fru.dto.operation.*;
import pl.aero.fru.security.UserPrincipal;
import pl.aero.fru.service.PlannedOperationService;

import java.util.List;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class PlannedOperationController {

    private final PlannedOperationService operationService;

    @GetMapping
    public ResponseEntity<Page<OperationListResponse>> findAll(
            @RequestParam(required = false, defaultValue = "3") Long statusId,
            Pageable pageable) {
        return ResponseEntity.ok(operationService.findAll(statusId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(operationService.findById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('Osoba planująca', 'Osoba nadzorująca')")
    public ResponseEntity<OperationResponse> create(
            @Valid @RequestPart("request") OperationCreateRequest request,
            @RequestPart("kmlFile") MultipartFile kmlFile,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(operationService.create(request, kmlFile, principal));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('Osoba planująca', 'Osoba nadzorująca')")
    public ResponseEntity<OperationResponse> update(
            @PathVariable Long id,
            @Valid @RequestPart("request") OperationUpdateRequest request,
            @RequestPart(value = "kmlFile", required = false) MultipartFile kmlFile,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationService.update(id, request, kmlFile, principal));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('Osoba planująca', 'Osoba nadzorująca')")
    public ResponseEntity<OperationResponse> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(operationService.changeStatus(id, request, principal));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('Osoba planująca', 'Osoba nadzorująca')")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(operationService.addComment(id, request, principal));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ChangeHistoryResponse>> getChangeHistory(@PathVariable Long id) {
        return ResponseEntity.ok(operationService.getChangeHistory(id));
    }

    @GetMapping("/{id}/kml")
    public ResponseEntity<byte[]> getKmlFile(@PathVariable Long id) {
        byte[] kmlData = operationService.getKmlFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=operation-" + id + ".kml")
                .contentType(MediaType.APPLICATION_XML)
                .body(kmlData);
    }
}
