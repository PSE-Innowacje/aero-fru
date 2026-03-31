package pl.aero.fru.validation;

import org.springframework.stereotype.Component;
import pl.aero.fru.entity.CrewMember;
import pl.aero.fru.entity.FlightOrder;
import pl.aero.fru.entity.Helicopter;
import pl.aero.fru.exception.FlightValidationException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class FlightOrderBusinessValidator {

    public void validate(FlightOrder order) {
        List<String> violations = new ArrayList<>();
        LocalDate flightDay = order.getPlannedStartAt().toLocalDate();
        Helicopter helicopter = order.getHelicopter();
        CrewMember pilot = order.getPilot();

        // 1. Helicopter inspection valid on flight day
        if (helicopter.getInspectionValidUntil() == null
                || helicopter.getInspectionValidUntil().isBefore(flightDay)) {
            violations.add("Śmigłowiec " + helicopter.getRegistrationNumber()
                    + " — przegląd nieważny w dniu lotu (" + flightDay + ")");
        }

        // 2. Pilot license valid on flight day
        if (pilot.getLicenseValidUntil() == null
                || pilot.getLicenseValidUntil().isBefore(flightDay)) {
            violations.add("Pilot " + pilot.getFirstName() + " " + pilot.getLastName()
                    + " — licencja nieważna w dniu lotu (" + flightDay + ")");
        }

        // 3. All crew training valid on flight day (including pilot)
        if (pilot.getTrainingValidUntil().isBefore(flightDay)) {
            violations.add("Pilot " + pilot.getFirstName() + " " + pilot.getLastName()
                    + " — szkolenie nieważne w dniu lotu (" + flightDay + ")");
        }
        for (CrewMember crew : order.getCrewMembers()) {
            if (crew.getTrainingValidUntil().isBefore(flightDay)) {
                violations.add("Członek załogi " + crew.getFirstName() + " " + crew.getLastName()
                        + " — szkolenie nieważne w dniu lotu (" + flightDay + ")");
            }
        }

        // 4. Crew weight <= helicopter max
        if (order.getCrewWeightKg() > helicopter.getMaxCrewWeightKg()) {
            violations.add("Waga załogi (" + order.getCrewWeightKg()
                    + " kg) przekracza maksimum śmigłowca (" + helicopter.getMaxCrewWeightKg() + " kg)");
        }

        // 5. Estimated route <= helicopter range
        if (order.getEstimatedRouteKm() > helicopter.getRangeKm()) {
            violations.add("Szacowana trasa (" + order.getEstimatedRouteKm()
                    + " km) przekracza zasięg śmigłowca (" + helicopter.getRangeKm() + " km)");
        }

        if (!violations.isEmpty()) {
            throw new FlightValidationException(violations);
        }
    }
}
