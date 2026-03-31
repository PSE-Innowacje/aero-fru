package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.OperationChangeHistory;

import java.util.List;

public interface OperationChangeHistoryRepository extends JpaRepository<OperationChangeHistory, Long> {
    List<OperationChangeHistory> findByOperationIdOrderByChangedAtDesc(Long operationId);
}
