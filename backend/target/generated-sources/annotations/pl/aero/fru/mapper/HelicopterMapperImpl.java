package pl.aero.fru.mapper;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import pl.aero.fru.dto.helicopter.HelicopterListResponse;
import pl.aero.fru.dto.helicopter.HelicopterRequest;
import pl.aero.fru.dto.helicopter.HelicopterResponse;
import pl.aero.fru.entity.Helicopter;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-31T10:46:30+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.6 (Microsoft)"
)
@Component
public class HelicopterMapperImpl implements HelicopterMapper {

    @Override
    public Helicopter toEntity(HelicopterRequest request) {
        if ( request == null ) {
            return null;
        }

        Helicopter helicopter = new Helicopter();

        helicopter.setRegistrationNumber( request.registrationNumber() );
        helicopter.setHelicopterType( request.helicopterType() );
        helicopter.setDescription( request.description() );
        helicopter.setMaxCrewMembers( request.maxCrewMembers() );
        helicopter.setMaxCrewWeightKg( request.maxCrewWeightKg() );
        helicopter.setStatus( request.status() );
        helicopter.setInspectionValidUntil( request.inspectionValidUntil() );
        helicopter.setRangeKm( request.rangeKm() );

        return helicopter;
    }

    @Override
    public HelicopterResponse toResponse(Helicopter entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String registrationNumber = null;
        String helicopterType = null;
        String description = null;
        Integer maxCrewMembers = null;
        Integer maxCrewWeightKg = null;
        String status = null;
        LocalDate inspectionValidUntil = null;
        Integer rangeKm = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        id = entity.getId();
        registrationNumber = entity.getRegistrationNumber();
        helicopterType = entity.getHelicopterType();
        description = entity.getDescription();
        maxCrewMembers = entity.getMaxCrewMembers();
        maxCrewWeightKg = entity.getMaxCrewWeightKg();
        status = entity.getStatus();
        inspectionValidUntil = entity.getInspectionValidUntil();
        rangeKm = entity.getRangeKm();
        createdAt = entity.getCreatedAt();
        updatedAt = entity.getUpdatedAt();

        HelicopterResponse helicopterResponse = new HelicopterResponse( id, registrationNumber, helicopterType, description, maxCrewMembers, maxCrewWeightKg, status, inspectionValidUntil, rangeKm, createdAt, updatedAt );

        return helicopterResponse;
    }

    @Override
    public HelicopterListResponse toListResponse(Helicopter entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String registrationNumber = null;
        String helicopterType = null;
        String status = null;

        id = entity.getId();
        registrationNumber = entity.getRegistrationNumber();
        helicopterType = entity.getHelicopterType();
        status = entity.getStatus();

        HelicopterListResponse helicopterListResponse = new HelicopterListResponse( id, registrationNumber, helicopterType, status );

        return helicopterListResponse;
    }

    @Override
    public void updateEntity(HelicopterRequest request, Helicopter entity) {
        if ( request == null ) {
            return;
        }

        entity.setRegistrationNumber( request.registrationNumber() );
        entity.setHelicopterType( request.helicopterType() );
        entity.setDescription( request.description() );
        entity.setMaxCrewMembers( request.maxCrewMembers() );
        entity.setMaxCrewWeightKg( request.maxCrewWeightKg() );
        entity.setStatus( request.status() );
        entity.setInspectionValidUntil( request.inspectionValidUntil() );
        entity.setRangeKm( request.rangeKm() );
    }
}
