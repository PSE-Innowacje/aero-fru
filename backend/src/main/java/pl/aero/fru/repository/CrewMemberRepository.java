package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.CrewMember;

import java.util.List;
import java.util.Optional;

public interface CrewMemberRepository extends JpaRepository<CrewMember, Long> {
    List<CrewMember> findAllByOrderByEmailAsc();
    List<CrewMember> findByRole_Name(String roleName);
    Optional<CrewMember> findByEmail(String email);
    boolean existsByEmail(String email);
}
