package pl.aero.fru.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import pl.aero.fru.dto.crew.CrewMemberListResponse;
import pl.aero.fru.dto.crew.CrewMemberRequest;
import pl.aero.fru.dto.crew.CrewMemberResponse;
import pl.aero.fru.entity.CrewMember;

@Mapper(componentModel = "spring")
public interface CrewMemberMapper {

    @Mapping(target = "role", ignore = true)
    CrewMember toEntity(CrewMemberRequest request);

    @Mapping(source = "role.name", target = "roleName")
    CrewMemberResponse toResponse(CrewMember entity);

    @Mapping(source = "role.name", target = "roleName")
    CrewMemberListResponse toListResponse(CrewMember entity);

    @Mapping(target = "role", ignore = true)
    void updateEntity(CrewMemberRequest request, @MappingTarget CrewMember entity);
}
