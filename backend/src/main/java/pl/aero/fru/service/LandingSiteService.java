package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.aero.fru.dto.landingsite.LandingSiteRequest;
import pl.aero.fru.dto.landingsite.LandingSiteResponse;
import pl.aero.fru.entity.LandingSite;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.mapper.LandingSiteMapper;
import pl.aero.fru.repository.LandingSiteRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LandingSiteService {

    private final LandingSiteRepository landingSiteRepository;
    private final LandingSiteMapper landingSiteMapper;

    public List<LandingSiteResponse> findAll() {
        return landingSiteRepository.findAllByOrderByNameAsc().stream()
                .map(landingSiteMapper::toResponse).toList();
    }

    public LandingSiteResponse findById(Long id) {
        return landingSiteMapper.toResponse(getLandingSite(id));
    }

    @Transactional
    public LandingSiteResponse create(LandingSiteRequest request) {
        LandingSite site = landingSiteMapper.toEntity(request);
        return landingSiteMapper.toResponse(landingSiteRepository.save(site));
    }

    @Transactional
    public LandingSiteResponse update(Long id, LandingSiteRequest request) {
        LandingSite site = getLandingSite(id);
        landingSiteMapper.updateEntity(request, site);
        return landingSiteMapper.toResponse(landingSiteRepository.save(site));
    }

    private LandingSite getLandingSite(Long id) {
        return landingSiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandingSite", id));
    }
}
