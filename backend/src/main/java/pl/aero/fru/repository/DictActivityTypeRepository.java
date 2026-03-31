package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.DictActivityType;

public interface DictActivityTypeRepository extends JpaRepository<DictActivityType, Long> {
}
