package pl.aero.fru.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import pl.aero.fru.dto.helicopter.HelicopterListResponse;
import pl.aero.fru.dto.helicopter.HelicopterRequest;
import pl.aero.fru.dto.helicopter.HelicopterResponse;
import pl.aero.fru.entity.Helicopter;

@Mapper(componentModel = "spring")
public interface HelicopterMapper {

    Helicopter toEntity(HelicopterRequest request);

    HelicopterResponse toResponse(Helicopter entity);

    HelicopterListResponse toListResponse(Helicopter entity);

    void updateEntity(HelicopterRequest request, @MappingTarget Helicopter entity);
}
