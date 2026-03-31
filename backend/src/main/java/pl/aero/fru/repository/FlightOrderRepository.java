package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pl.aero.fru.entity.FlightOrder;

public interface FlightOrderRepository extends JpaRepository<FlightOrder, Long>,
        JpaSpecificationExecutor<FlightOrder> {
}
