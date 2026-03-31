package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.DictOperationStatus;

public interface DictOperationStatusRepository extends JpaRepository<DictOperationStatus, Long> {
}
