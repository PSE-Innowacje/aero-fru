package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.aero.fru.dto.dictionary.DictionaryResponse;
import pl.aero.fru.dto.operation.*;
import pl.aero.fru.entity.*;
import pl.aero.fru.exception.BusinessRuleException;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.repository.*;
import pl.aero.fru.security.UserPrincipal;
import pl.aero.fru.validation.OperationStatusTransitionValidator;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlannedOperationService {

    private final PlannedOperationRepository operationRepository;
    private final DictOperationStatusRepository statusRepository;
    private final DictActivityTypeRepository activityTypeRepository;
    private final UserRepository userRepository;
    private final OperationCommentRepository commentRepository;
    private final OperationChangeHistoryRepository changeHistoryRepository;
    private final KmlService kmlService;
    private final OracleContextService oracleContextService;
    private final OperationStatusTransitionValidator statusTransitionValidator;

    @Transactional(readOnly = true)
    public Page<OperationListResponse> findAll(Long statusId, Pageable pageable) {
        Specification<PlannedOperation> spec = Specification.where(null);
        if (statusId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status").get("id"), statusId));
        }

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.ASC, "plannedDateEarliest"));
        }

        return operationRepository.findAll(spec, pageable).map(this::toListResponse);
    }

    @Transactional(readOnly = true)
    public OperationResponse findById(Long id) {
        PlannedOperation op = getOperation(id);
        return toResponse(op);
    }

    @Transactional
    public OperationResponse create(OperationCreateRequest request, MultipartFile kmlFile, UserPrincipal principal) {
        byte[] kmlData = readKmlFile(kmlFile);
        int routeKm = kmlService.calculateRouteKm(kmlData);

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));

        DictOperationStatus defaultStatus = statusRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("OperationStatus", 1L));

        Set<DictActivityType> activityTypes = resolveActivityTypes(request.activityTypeIds());

        PlannedOperation op = new PlannedOperation();
        op.setOrderProjectNumber(request.orderProjectNumber());
        op.setShortDescription(request.shortDescription());
        op.setKmlPoints(kmlData);
        op.setProposedDateEarliest(request.proposedDateEarliest());
        op.setProposedDateLatest(request.proposedDateLatest());
        op.setAdditionalInfo(request.additionalInfo());
        op.setRouteKm(routeKm);
        op.setStatus(defaultStatus);
        op.setIntroducedBy(user);
        op.setActivityTypes(activityTypes);

        if (request.contactPersonEmails() != null) {
            for (String email : request.contactPersonEmails()) {
                OperationContactPerson contact = new OperationContactPerson();
                contact.setEmail(email);
                contact.setOperation(op);
                op.getContactPersons().add(contact);
            }
        }

        op = operationRepository.save(op);
        return toResponse(op);
    }

    @Transactional
    public OperationResponse update(Long id, OperationUpdateRequest request, MultipartFile kmlFile, UserPrincipal principal) {
        PlannedOperation op = getOperation(id);
        String roleName = principal.getRoleName();

        // Check edit permissions by status
        boolean isPlanner = "Osoba planująca".equals(roleName);
        boolean isSupervisor = "Osoba nadzorująca".equals(roleName);
        Long currentStatusId = op.getStatus().getId();

        if (isPlanner && !Set.of(1L, 2L, 3L, 4L, 5L).contains(currentStatusId)) {
            throw new BusinessRuleException("Osoba planująca nie może edytować operacji w statusie " + currentStatusId);
        }

        // Set Oracle context for change history trigger
        oracleContextService.setUserId(principal.getId());

        op.setOrderProjectNumber(request.orderProjectNumber());
        op.setShortDescription(request.shortDescription());
        op.setProposedDateEarliest(request.proposedDateEarliest());
        op.setProposedDateLatest(request.proposedDateLatest());
        op.setAdditionalInfo(request.additionalInfo());

        // Supervisor-only fields
        if (isSupervisor) {
            op.setPlannedDateEarliest(request.plannedDateEarliest());
            op.setPlannedDateLatest(request.plannedDateLatest());
            op.setPostRealizationNotes(request.postRealizationNotes());
        }

        // Update KML if new file provided
        if (kmlFile != null && !kmlFile.isEmpty()) {
            byte[] kmlData = readKmlFile(kmlFile);
            op.setKmlPoints(kmlData);
            op.setRouteKm(kmlService.calculateRouteKm(kmlData));
        }

        // Update activity types
        Set<DictActivityType> activityTypes = resolveActivityTypes(request.activityTypeIds());
        op.getActivityTypes().clear();
        op.getActivityTypes().addAll(activityTypes);

        // Update contact persons
        op.getContactPersons().clear();
        if (request.contactPersonEmails() != null) {
            for (String email : request.contactPersonEmails()) {
                OperationContactPerson contact = new OperationContactPerson();
                contact.setEmail(email);
                contact.setOperation(op);
                op.getContactPersons().add(contact);
            }
        }

        op = operationRepository.save(op);
        return toResponse(op);
    }

    @Transactional
    public OperationResponse changeStatus(Long id, StatusChangeRequest request, UserPrincipal principal) {
        PlannedOperation op = getOperation(id);
        Long fromStatusId = op.getStatus().getId();
        Long toStatusId = request.statusId();

        statusTransitionValidator.validate(fromStatusId, toStatusId, principal.getRoleName());

        // Validate: transition 1->3 requires planned dates
        if (fromStatusId == 1L && toStatusId == 3L) {
            if (op.getPlannedDateEarliest() == null || op.getPlannedDateLatest() == null) {
                throw new BusinessRuleException("Daty planowane są wymagane do potwierdzenia operacji do planu");
            }
        }

        oracleContextService.setUserId(principal.getId());

        DictOperationStatus newStatus = statusRepository.findById(toStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("OperationStatus", toStatusId));
        op.setStatus(newStatus);

        op = operationRepository.save(op);
        return toResponse(op);
    }

    @Transactional
    public void changeStatusBySystem(Long operationId, Long toStatusId) {
        PlannedOperation op = getOperation(operationId);
        statusTransitionValidator.validateSystemTransition(op.getStatus().getId(), toStatusId);

        DictOperationStatus newStatus = statusRepository.findById(toStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("OperationStatus", toStatusId));
        op.setStatus(newStatus);
        operationRepository.save(op);
    }

    @Transactional
    public CommentResponse addComment(Long operationId, CommentRequest request, UserPrincipal principal) {
        PlannedOperation op = getOperation(operationId);
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", principal.getId()));

        OperationComment comment = new OperationComment();
        comment.setOperation(op);
        comment.setCommentText(request.commentText());
        comment.setCreatedBy(user);

        comment = commentRepository.save(comment);
        return new CommentResponse(comment.getId(), comment.getCommentText(),
                user.getEmail(), comment.getCreatedAt());
    }

    public List<ChangeHistoryResponse> getChangeHistory(Long operationId) {
        getOperation(operationId); // verify exists
        return changeHistoryRepository.findByOperationIdOrderByChangedAtDesc(operationId).stream()
                .map(h -> new ChangeHistoryResponse(
                        h.getId(), h.getFieldName(), h.getOldValue(), h.getNewValue(),
                        h.getChangedBy().getEmail(), h.getChangedAt()))
                .toList();
    }

    public byte[] getKmlFile(Long operationId) {
        PlannedOperation op = getOperation(operationId);
        return op.getKmlPoints();
    }

    private PlannedOperation getOperation(Long id) {
        return operationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PlannedOperation", id));
    }

    private byte[] readKmlFile(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new BusinessRuleException("Nie udało się odczytać pliku KML");
        }
    }

    private Set<DictActivityType> resolveActivityTypes(Set<Long> ids) {
        Set<DictActivityType> types = new HashSet<>(activityTypeRepository.findAllById(ids));
        if (types.size() != ids.size()) {
            throw new ResourceNotFoundException("Nie znaleziono jednego lub więcej typów czynności");
        }
        return types;
    }

    private OperationListResponse toListResponse(PlannedOperation op) {
        return new OperationListResponse(
                op.getId(), op.getOperationNumber(), op.getOrderProjectNumber(),
                op.getActivityTypes().stream().map(DictActivityType::getName).collect(Collectors.toSet()),
                op.getProposedDateEarliest(), op.getProposedDateLatest(),
                op.getPlannedDateEarliest(), op.getPlannedDateLatest(),
                op.getStatus().getName());
    }

    private OperationResponse toResponse(PlannedOperation op) {
        List<CommentResponse> comments = op.getComments().stream()
                .map(c -> new CommentResponse(c.getId(), c.getCommentText(),
                        c.getCreatedBy().getEmail(), c.getCreatedAt()))
                .toList();

        Set<DictionaryResponse> activityTypes = op.getActivityTypes().stream()
                .map(at -> new DictionaryResponse(at.getId(), at.getName()))
                .collect(Collectors.toSet());

        return new OperationResponse(
                op.getId(), op.getOperationNumber(), op.getOrderProjectNumber(),
                op.getShortDescription(),
                op.getProposedDateEarliest(), op.getProposedDateLatest(),
                activityTypes, op.getAdditionalInfo(), op.getRouteKm(),
                op.getPlannedDateEarliest(), op.getPlannedDateLatest(),
                new DictionaryResponse(op.getStatus().getId(), op.getStatus().getName()),
                op.getIntroducedBy().getEmail(), op.getPostRealizationNotes(),
                op.getContactPersons().stream().map(OperationContactPerson::getEmail).toList(),
                comments,
                List.of(), // linked flight order IDs - populated via query if needed
                op.getCreatedAt(), op.getUpdatedAt());
    }
}
