package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.OperationContactPerson;

public interface OperationContactPersonRepository extends JpaRepository<OperationContactPerson, Long> {
}
