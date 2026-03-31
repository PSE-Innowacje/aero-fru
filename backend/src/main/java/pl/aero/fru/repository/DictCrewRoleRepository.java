package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.DictCrewRole;

import java.util.Optional;

public interface DictCrewRoleRepository extends JpaRepository<DictCrewRole, Long> {
    Optional<DictCrewRole> findByName(String name);
}
