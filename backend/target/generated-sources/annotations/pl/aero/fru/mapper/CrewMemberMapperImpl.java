package pl.aero.fru.mapper;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import pl.aero.fru.dto.crew.CrewMemberListResponse;
import pl.aero.fru.dto.crew.CrewMemberRequest;
import pl.aero.fru.dto.crew.CrewMemberResponse;
import pl.aero.fru.entity.CrewMember;
import pl.aero.fru.entity.DictCrewRole;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-31T10:46:31+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.6 (Microsoft)"
)
@Component
public class CrewMemberMapperImpl implements CrewMemberMapper {

    @Override
    public CrewMember toEntity(CrewMemberRequest request) {
        if ( request == null ) {
            return null;
        }

        CrewMember crewMember = new CrewMember();

        crewMember.setFirstName( request.firstName() );
        crewMember.setLastName( request.lastName() );
        crewMember.setEmail( request.email() );
        crewMember.setWeightKg( request.weightKg() );
        crewMember.setPilotLicenseNumber( request.pilotLicenseNumber() );
        crewMember.setLicenseValidUntil( request.licenseValidUntil() );
        crewMember.setTrainingValidUntil( request.trainingValidUntil() );

        return crewMember;
    }

    @Override
    public CrewMemberResponse toResponse(CrewMember entity) {
        if ( entity == null ) {
            return null;
        }

        String roleName = null;
        Long id = null;
        String firstName = null;
        String lastName = null;
        String email = null;
        Integer weightKg = null;
        String pilotLicenseNumber = null;
        LocalDate licenseValidUntil = null;
        LocalDate trainingValidUntil = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        roleName = entityRoleName( entity );
        id = entity.getId();
        firstName = entity.getFirstName();
        lastName = entity.getLastName();
        email = entity.getEmail();
        weightKg = entity.getWeightKg();
        pilotLicenseNumber = entity.getPilotLicenseNumber();
        licenseValidUntil = entity.getLicenseValidUntil();
        trainingValidUntil = entity.getTrainingValidUntil();
        createdAt = entity.getCreatedAt();
        updatedAt = entity.getUpdatedAt();

        CrewMemberResponse crewMemberResponse = new CrewMemberResponse( id, firstName, lastName, email, weightKg, roleName, pilotLicenseNumber, licenseValidUntil, trainingValidUntil, createdAt, updatedAt );

        return crewMemberResponse;
    }

    @Override
    public CrewMemberListResponse toListResponse(CrewMember entity) {
        if ( entity == null ) {
            return null;
        }

        String roleName = null;
        Long id = null;
        String email = null;
        LocalDate licenseValidUntil = null;
        LocalDate trainingValidUntil = null;

        roleName = entityRoleName( entity );
        id = entity.getId();
        email = entity.getEmail();
        licenseValidUntil = entity.getLicenseValidUntil();
        trainingValidUntil = entity.getTrainingValidUntil();

        CrewMemberListResponse crewMemberListResponse = new CrewMemberListResponse( id, email, roleName, licenseValidUntil, trainingValidUntil );

        return crewMemberListResponse;
    }

    @Override
    public void updateEntity(CrewMemberRequest request, CrewMember entity) {
        if ( request == null ) {
            return;
        }

        entity.setFirstName( request.firstName() );
        entity.setLastName( request.lastName() );
        entity.setEmail( request.email() );
        entity.setWeightKg( request.weightKg() );
        entity.setPilotLicenseNumber( request.pilotLicenseNumber() );
        entity.setLicenseValidUntil( request.licenseValidUntil() );
        entity.setTrainingValidUntil( request.trainingValidUntil() );
    }

    private String entityRoleName(CrewMember crewMember) {
        DictCrewRole role = crewMember.getRole();
        if ( role == null ) {
            return null;
        }
        return role.getName();
    }
}
