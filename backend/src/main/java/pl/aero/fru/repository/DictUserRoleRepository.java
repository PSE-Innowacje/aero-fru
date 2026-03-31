package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.DictUserRole;

import java.util.Optional;

public interface DictUserRoleRepository extends JpaRepository<DictUserRole, Long> {
    Optional<DictUserRole> findByName(String name);
}
