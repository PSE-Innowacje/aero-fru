package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pl.aero.fru.entity.PlannedOperation;

import java.util.List;
import java.util.Set;

public interface PlannedOperationRepository extends JpaRepository<PlannedOperation, Long>,
        JpaSpecificationExecutor<PlannedOperation> {
    List<PlannedOperation> findByIdIn(Set<Long> ids);
}
