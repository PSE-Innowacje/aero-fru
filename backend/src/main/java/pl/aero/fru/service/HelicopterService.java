package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.aero.fru.dto.helicopter.HelicopterListResponse;
import pl.aero.fru.dto.helicopter.HelicopterRequest;
import pl.aero.fru.dto.helicopter.HelicopterResponse;
import pl.aero.fru.entity.Helicopter;
import pl.aero.fru.exception.BusinessRuleException;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.mapper.HelicopterMapper;
import pl.aero.fru.repository.HelicopterRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HelicopterService {

    private final HelicopterRepository helicopterRepository;
    private final HelicopterMapper helicopterMapper;

    public List<HelicopterListResponse> findAll() {
        return helicopterRepository.findAllByOrderByStatusAscRegistrationNumberAsc().stream()
                .map(helicopterMapper::toListResponse).toList();
    }

    public HelicopterResponse findById(Long id) {
        return helicopterMapper.toResponse(getHelicopter(id));
    }

    @Transactional
    public HelicopterResponse create(HelicopterRequest request) {
        validateInspection(request);
        Helicopter helicopter = helicopterMapper.toEntity(request);
        return helicopterMapper.toResponse(helicopterRepository.save(helicopter));
    }

    @Transactional
    public HelicopterResponse update(Long id, HelicopterRequest request) {
        validateInspection(request);
        Helicopter helicopter = getHelicopter(id);
        helicopterMapper.updateEntity(request, helicopter);
        return helicopterMapper.toResponse(helicopterRepository.save(helicopter));
    }

    private Helicopter getHelicopter(Long id) {
        return helicopterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Helicopter", id));
    }

    private void validateInspection(HelicopterRequest request) {
        if ("active".equals(request.status()) && request.inspectionValidUntil() == null) {
            throw new BusinessRuleException("Data ważności przeglądu jest wymagana dla aktywnych śmigłowców");
        }
    }
}
