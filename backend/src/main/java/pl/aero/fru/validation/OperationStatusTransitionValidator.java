package pl.aero.fru.validation;

import org.springframework.stereotype.Component;
import pl.aero.fru.exception.InvalidStatusTransitionException;

import java.util.Map;
import java.util.Set;

@Component
public class OperationStatusTransitionValidator {

    // Status IDs from PRD:
    // 1=Wprowadzone, 2=Odrzucone, 3=Potwierdzone do planu,
    // 4=Zaplanowane do zlecenia, 5=Częściowo zrealizowane,
    // 6=Zrealizowane, 7=Rezygnacja

    private static final String SUPERVISOR = "Osoba nadzorująca";
    private static final String PLANNER = "Osoba planująca";
    private static final String SYSTEM = "SYSTEM";

    // Map of (from, to) -> allowed roles
    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry("1->2", Set.of(SUPERVISOR)),
            Map.entry("1->3", Set.of(SUPERVISOR)),
            Map.entry("1->7", Set.of(PLANNER)),
            Map.entry("3->4", Set.of(SYSTEM)),
            Map.entry("3->7", Set.of(PLANNER)),
            Map.entry("4->3", Set.of(SYSTEM)),
            Map.entry("4->5", Set.of(SYSTEM)),
            Map.entry("4->6", Set.of(SYSTEM)),
            Map.entry("4->7", Set.of(PLANNER))
    );

    public void validate(Long fromStatusId, Long toStatusId, String userRole) {
        String key = fromStatusId + "->" + toStatusId;
        Set<String> allowedRoles = ALLOWED_TRANSITIONS.get(key);

        if (allowedRoles == null) {
            throw new InvalidStatusTransitionException(fromStatusId, toStatusId);
        }

        if (!allowedRoles.contains(userRole) && !allowedRoles.contains(SYSTEM)) {
            throw new InvalidStatusTransitionException(
                    "Role " + userRole + " is not allowed to change status from " + fromStatusId + " to " + toStatusId);
        }
    }

    public void validateSystemTransition(Long fromStatusId, Long toStatusId) {
        String key = fromStatusId + "->" + toStatusId;
        Set<String> allowedRoles = ALLOWED_TRANSITIONS.get(key);

        if (allowedRoles == null || !allowedRoles.contains(SYSTEM)) {
            throw new InvalidStatusTransitionException(fromStatusId, toStatusId);
        }
    }
}
