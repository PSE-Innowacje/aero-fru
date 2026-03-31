package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.aero.fru.dto.dictionary.DictionaryResponse;
import pl.aero.fru.repository.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final DictCrewRoleRepository crewRoleRepository;
    private final DictUserRoleRepository userRoleRepository;
    private final DictActivityTypeRepository activityTypeRepository;
    private final DictOperationStatusRepository operationStatusRepository;
    private final DictFlightOrderStatusRepository flightOrderStatusRepository;

    public List<DictionaryResponse> getCrewRoles() {
        return crewRoleRepository.findAll().stream()
                .map(r -> new DictionaryResponse(r.getId(), r.getName())).toList();
    }

    public List<DictionaryResponse> getUserRoles() {
        return userRoleRepository.findAll().stream()
                .map(r -> new DictionaryResponse(r.getId(), r.getName())).toList();
    }

    public List<DictionaryResponse> getActivityTypes() {
        return activityTypeRepository.findAll().stream()
                .map(r -> new DictionaryResponse(r.getId(), r.getName())).toList();
    }

    public List<DictionaryResponse> getOperationStatuses() {
        return operationStatusRepository.findAll().stream()
                .map(r -> new DictionaryResponse(r.getId(), r.getName())).toList();
    }

    public List<DictionaryResponse> getFlightOrderStatuses() {
        return flightOrderStatusRepository.findAll().stream()
                .map(r -> new DictionaryResponse(r.getId(), r.getName())).toList();
    }
}
