package pl.aero.fru.mapper;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import pl.aero.fru.dto.landingsite.LandingSiteRequest;
import pl.aero.fru.dto.landingsite.LandingSiteResponse;
import pl.aero.fru.entity.LandingSite;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-31T10:46:31+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.6 (Microsoft)"
)
@Component
public class LandingSiteMapperImpl implements LandingSiteMapper {

    @Override
    public LandingSite toEntity(LandingSiteRequest request) {
        if ( request == null ) {
            return null;
        }

        LandingSite landingSite = new LandingSite();

        landingSite.setName( request.name() );
        landingSite.setLatitude( request.latitude() );
        landingSite.setLongitude( request.longitude() );

        return landingSite;
    }

    @Override
    public LandingSiteResponse toResponse(LandingSite entity) {
        if ( entity == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        BigDecimal latitude = null;
        BigDecimal longitude = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        id = entity.getId();
        name = entity.getName();
        latitude = entity.getLatitude();
        longitude = entity.getLongitude();
        createdAt = entity.getCreatedAt();
        updatedAt = entity.getUpdatedAt();

        LandingSiteResponse landingSiteResponse = new LandingSiteResponse( id, name, latitude, longitude, createdAt, updatedAt );

        return landingSiteResponse;
    }

    @Override
    public void updateEntity(LandingSiteRequest request, LandingSite entity) {
        if ( request == null ) {
            return;
        }

        entity.setName( request.name() );
        entity.setLatitude( request.latitude() );
        entity.setLongitude( request.longitude() );
    }
}
