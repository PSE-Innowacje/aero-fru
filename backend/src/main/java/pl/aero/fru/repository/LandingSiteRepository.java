package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.LandingSite;

import java.util.List;

public interface LandingSiteRepository extends JpaRepository<LandingSite, Long> {
    List<LandingSite> findAllByOrderByNameAsc();
}
