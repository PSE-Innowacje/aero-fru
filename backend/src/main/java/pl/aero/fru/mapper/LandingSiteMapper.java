package pl.aero.fru.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import pl.aero.fru.dto.landingsite.LandingSiteRequest;
import pl.aero.fru.dto.landingsite.LandingSiteResponse;
import pl.aero.fru.entity.LandingSite;

@Mapper(componentModel = "spring")
public interface LandingSiteMapper {

    LandingSite toEntity(LandingSiteRequest request);

    LandingSiteResponse toResponse(LandingSite entity);

    void updateEntity(LandingSiteRequest request, @MappingTarget LandingSite entity);
}
