package pl.aero.fru.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.aero.fru.entity.Helicopter;

import java.util.List;

public interface HelicopterRepository extends JpaRepository<Helicopter, Long> {
    List<Helicopter> findAllByOrderByStatusAscRegistrationNumberAsc();
    List<Helicopter> findByStatus(String status);
}
