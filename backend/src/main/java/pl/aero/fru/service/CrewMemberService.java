package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.aero.fru.dto.crew.CrewMemberListResponse;
import pl.aero.fru.dto.crew.CrewMemberRequest;
import pl.aero.fru.dto.crew.CrewMemberResponse;
import pl.aero.fru.entity.CrewMember;
import pl.aero.fru.entity.DictCrewRole;
import pl.aero.fru.exception.BusinessRuleException;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.mapper.CrewMemberMapper;
import pl.aero.fru.repository.CrewMemberRepository;
import pl.aero.fru.repository.DictCrewRoleRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CrewMemberService {

    private final CrewMemberRepository crewMemberRepository;
    private final DictCrewRoleRepository crewRoleRepository;
    private final CrewMemberMapper crewMemberMapper;

    public List<CrewMemberListResponse> findAll() {
        return crewMemberRepository.findAllByOrderByEmailAsc().stream()
                .map(crewMemberMapper::toListResponse).toList();
    }

    public CrewMemberResponse findById(Long id) {
        return crewMemberMapper.toResponse(getCrewMember(id));
    }

    @Transactional
    public CrewMemberResponse create(CrewMemberRequest request) {
        if (crewMemberRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Crew member with email " + request.email() + " already exists");
        }

        DictCrewRole role = crewRoleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("CrewRole", request.roleId()));

        CrewMember member = crewMemberMapper.toEntity(request);
        member.setRole(role);

        return crewMemberMapper.toResponse(crewMemberRepository.save(member));
    }

    @Transactional
    public CrewMemberResponse update(Long id, CrewMemberRequest request) {
        CrewMember member = getCrewMember(id);

        if (!member.getEmail().equals(request.email()) && crewMemberRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("Crew member with email " + request.email() + " already exists");
        }

        DictCrewRole role = crewRoleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("CrewRole", request.roleId()));

        crewMemberMapper.updateEntity(request, member);
        member.setRole(role);

        return crewMemberMapper.toResponse(crewMemberRepository.save(member));
    }

    private CrewMember getCrewMember(Long id) {
        return crewMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CrewMember", id));
    }
}
