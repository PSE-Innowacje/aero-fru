package pl.aero.fru.validation;

import org.springframework.stereotype.Component;
import pl.aero.fru.exception.InvalidStatusTransitionException;

import java.util.Map;
import java.util.Set;

@Component
public class FlightOrderStatusTransitionValidator {

    // Flight order status IDs from PRD:
    // 1=Wprowadzone, 2=Przekazane do akceptacji, 3=Odrzucone,
    // 4=Zaakceptowane, 5=Zrealizowane w części, 6=Zrealizowane w całości,
    // 7=Nie zrealizowane

    private static final String SUPERVISOR = "Osoba nadzorująca";
    private static final String PILOT = "Pilot";

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.ofEntries(
            Map.entry("1->2", Set.of(PILOT)),
            Map.entry("2->3", Set.of(SUPERVISOR)),
            Map.entry("2->4", Set.of(SUPERVISOR)),
            Map.entry("4->5", Set.of(PILOT)),
            Map.entry("4->6", Set.of(PILOT)),
            Map.entry("4->7", Set.of(PILOT))
    );

    public void validate(Long fromStatusId, Long toStatusId, String userRole) {
        String key = fromStatusId + "->" + toStatusId;
        Set<String> allowedRoles = ALLOWED_TRANSITIONS.get(key);

        if (allowedRoles == null) {
            throw new InvalidStatusTransitionException(fromStatusId, toStatusId);
        }

        if (!allowedRoles.contains(userRole)) {
            throw new InvalidStatusTransitionException(
                    "Rola " + userRole + " nie ma uprawnień do zmiany statusu zlecenia lotu z "
                            + fromStatusId + " na " + toStatusId);
        }
    }
}
