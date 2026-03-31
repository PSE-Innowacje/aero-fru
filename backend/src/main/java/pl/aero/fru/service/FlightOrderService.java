package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.aero.fru.dto.dictionary.DictionaryResponse;
import pl.aero.fru.dto.flightorder.*;
import pl.aero.fru.entity.*;
import pl.aero.fru.exception.BusinessRuleException;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.repository.*;
import pl.aero.fru.security.UserPrincipal;
import pl.aero.fru.validation.FlightOrderBusinessValidator;
import pl.aero.fru.validation.FlightOrderStatusTransitionValidator;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightOrderService {

    private final FlightOrderRepository flightOrderRepository;
    private final DictFlightOrderStatusRepository statusRepository;
    private final CrewMemberRepository crewMemberRepository;
    private final HelicopterRepository helicopterRepository;
    private final LandingSiteRepository landingSiteRepository;
    private final PlannedOperationRepository operationRepository;
    private final PlannedOperationService plannedOperationService;
    private final FlightOrderBusinessValidator businessValidator;
    private final FlightOrderStatusTransitionValidator statusTransitionValidator;

    public Page<FlightOrderListResponse> findAll(Long statusId, Pageable pageable) {
        Specification<FlightOrder> spec = Specification.where(null);
        if (statusId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status").get("id"), statusId));
        }

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.ASC, "plannedStartAt"));
        }

        return flightOrderRepository.findAll(spec, pageable).map(this::toListResponse);
    }

    public FlightOrderResponse findById(Long id) {
        return toResponse(getFlightOrder(id));
    }

    @Transactional
    public FlightOrderResponse create(FlightOrderCreateRequest request, UserPrincipal principal) {
        CrewMember pilot = crewMemberRepository.findById(request.pilotId())
                .orElseThrow(() -> new ResourceNotFoundException("CrewMember", request.pilotId()));
        Helicopter helicopter = helicopterRepository.findById(request.helicopterId())
                .orElseThrow(() -> new ResourceNotFoundException("Helicopter", request.helicopterId()));
        LandingSite startSite = landingSiteRepository.findById(request.startLandingSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("LandingSite", request.startLandingSiteId()));
        LandingSite endSite = landingSiteRepository.findById(request.endLandingSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("LandingSite", request.endLandingSiteId()));

        if (!"active".equals(helicopter.getStatus())) {
            throw new BusinessRuleException("Tylko aktywne śmigłowce mogą być przypisane do zleceń lotu");
        }

        // Resolve crew members
        Set<CrewMember> crewMembers = new HashSet<>();
        if (request.crewMemberIds() != null) {
            crewMembers = new HashSet<>(crewMemberRepository.findAllById(request.crewMemberIds()));
        }

        // Calculate crew weight (pilot + all crew)
        int crewWeight = pilot.getWeightKg();
        for (CrewMember cm : crewMembers) {
            crewWeight += cm.getWeightKg();
        }

        // Resolve operations (must have status 3 = Potwierdzone do planu)
        Set<PlannedOperation> operations = new HashSet<>(operationRepository.findByIdIn(request.operationIds()));
        if (operations.size() != request.operationIds().size()) {
            throw new ResourceNotFoundException("Nie znaleziono jednej lub więcej operacji planowanych");
        }
        for (PlannedOperation op : operations) {
            if (op.getStatus().getId() != 3L) {
                throw new BusinessRuleException(
                        "Operacja " + op.getOperationNumber() + " nie ma statusu 'Potwierdzone do planu' (3)");
            }
        }

        DictFlightOrderStatus defaultStatus = statusRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("FlightOrderStatus", 1L));

        FlightOrder order = new FlightOrder();
        order.setPlannedStartAt(request.plannedStartAt());
        order.setPlannedLandingAt(request.plannedLandingAt());
        order.setPilot(pilot);
        order.setHelicopter(helicopter);
        order.setStatus(defaultStatus);
        order.setCrewWeightKg(crewWeight);
        order.setStartLandingSite(startSite);
        order.setEndLandingSite(endSite);
        order.setCrewMembers(crewMembers);
        order.setOperations(operations);
        order.setEstimatedRouteKm(request.estimatedRouteKm());

        // Run business validations
        businessValidator.validate(order);

        order = flightOrderRepository.save(order);

        // Transition linked operations from 3 (Potwierdzone) to 4 (Zaplanowane)
        for (PlannedOperation op : operations) {
            plannedOperationService.changeStatusBySystem(op.getId(), 4L);
        }

        return toResponse(order);
    }

    @Transactional
    public FlightOrderResponse update(Long id, FlightOrderUpdateRequest request, UserPrincipal principal) {
        FlightOrder order = getFlightOrder(id);

        CrewMember pilot = crewMemberRepository.findById(request.pilotId())
                .orElseThrow(() -> new ResourceNotFoundException("CrewMember", request.pilotId()));
        Helicopter helicopter = helicopterRepository.findById(request.helicopterId())
                .orElseThrow(() -> new ResourceNotFoundException("Helicopter", request.helicopterId()));
        LandingSite startSite = landingSiteRepository.findById(request.startLandingSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("LandingSite", request.startLandingSiteId()));
        LandingSite endSite = landingSiteRepository.findById(request.endLandingSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("LandingSite", request.endLandingSiteId()));

        Set<CrewMember> crewMembers = new HashSet<>();
        if (request.crewMemberIds() != null) {
            crewMembers = new HashSet<>(crewMemberRepository.findAllById(request.crewMemberIds()));
        }

        int crewWeight = pilot.getWeightKg();
        for (CrewMember cm : crewMembers) {
            crewWeight += cm.getWeightKg();
        }

        order.setPlannedStartAt(request.plannedStartAt());
        order.setPlannedLandingAt(request.plannedLandingAt());
        order.setPilot(pilot);
        order.setHelicopter(helicopter);
        order.setCrewWeightKg(crewWeight);
        order.setStartLandingSite(startSite);
        order.setEndLandingSite(endSite);
        order.setCrewMembers(crewMembers);
        order.setEstimatedRouteKm(request.estimatedRouteKm());
        order.setActualStartAt(request.actualStartAt());
        order.setActualLandingAt(request.actualLandingAt());

        businessValidator.validate(order);

        order = flightOrderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public FlightOrderResponse changeStatus(Long id, FlightOrderStatusChangeRequest request, UserPrincipal principal) {
        FlightOrder order = getFlightOrder(id);
        Long fromStatusId = order.getStatus().getId();
        Long toStatusId = request.statusId();

        statusTransitionValidator.validate(fromStatusId, toStatusId, principal.getRoleName());

        // Transitions to 5/6 require actual times
        if ((toStatusId == 5L || toStatusId == 6L)
                && (order.getActualStartAt() == null || order.getActualLandingAt() == null)) {
            throw new BusinessRuleException("Rzeczywiste czasy startu i lądowania są wymagane do realizacji");
        }

        DictFlightOrderStatus newStatus = statusRepository.findById(toStatusId)
                .orElseThrow(() -> new ResourceNotFoundException("FlightOrderStatus", toStatusId));
        order.setStatus(newStatus);
        order = flightOrderRepository.save(order);

        // Cascade operation status changes
        Long operationTargetStatus = switch (toStatusId.intValue()) {
            case 5 -> 5L; // Partially realized -> all ops to 5
            case 6 -> 6L; // Fully realized -> all ops to 6
            case 7 -> 3L; // Not realized -> all ops back to 3
            default -> null;
        };

        if (operationTargetStatus != null) {
            for (PlannedOperation op : order.getOperations()) {
                plannedOperationService.changeStatusBySystem(op.getId(), operationTargetStatus);
            }
        }

        return toResponse(order);
    }

    private FlightOrder getFlightOrder(Long id) {
        return flightOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlightOrder", id));
    }

    private FlightOrderListResponse toListResponse(FlightOrder order) {
        return new FlightOrderListResponse(
                order.getId(), order.getOrderNumber(),
                order.getPlannedStartAt(),
                order.getHelicopter().getRegistrationNumber(),
                order.getPilot().getFirstName() + " " + order.getPilot().getLastName(),
                order.getStatus().getName());
    }

    private FlightOrderResponse toResponse(FlightOrder order) {
        return new FlightOrderResponse(
                order.getId(), order.getOrderNumber(),
                order.getPlannedStartAt(), order.getPlannedLandingAt(),
                new FlightOrderResponse.CrewMemberSummary(
                        order.getPilot().getId(),
                        order.getPilot().getFirstName(),
                        order.getPilot().getLastName()),
                new DictionaryResponse(order.getStatus().getId(), order.getStatus().getName()),
                new FlightOrderResponse.HelicopterSummary(
                        order.getHelicopter().getId(),
                        order.getHelicopter().getRegistrationNumber(),
                        order.getHelicopter().getHelicopterType()),
                order.getCrewWeightKg(),
                new FlightOrderResponse.LandingSiteSummary(
                        order.getStartLandingSite().getId(),
                        order.getStartLandingSite().getName()),
                new FlightOrderResponse.LandingSiteSummary(
                        order.getEndLandingSite().getId(),
                        order.getEndLandingSite().getName()),
                order.getCrewMembers().stream()
                        .map(cm -> new FlightOrderResponse.CrewMemberSummary(
                                cm.getId(), cm.getFirstName(), cm.getLastName()))
                        .collect(Collectors.toSet()),
                order.getOperations().stream()
                        .map(op -> new FlightOrderResponse.OperationSummary(
                                op.getId(), op.getOperationNumber(), op.getShortDescription()))
                        .collect(Collectors.toSet()),
                order.getEstimatedRouteKm(),
                order.getActualStartAt(), order.getActualLandingAt(),
                order.getCreatedAt(), order.getUpdatedAt());
    }
}
