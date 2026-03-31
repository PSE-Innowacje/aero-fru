package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.DictFlightOrderStatus;

public interface DictFlightOrderStatusRepository extends JpaRepository<DictFlightOrderStatus, Long> {
}
