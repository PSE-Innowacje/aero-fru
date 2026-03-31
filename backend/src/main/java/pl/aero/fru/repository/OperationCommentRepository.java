package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.OperationComment;

import java.util.List;

public interface OperationCommentRepository extends JpaRepository<OperationComment, Long> {
    List<OperationComment> findByOperationIdOrderByCreatedAtAsc(Long operationId);
}
