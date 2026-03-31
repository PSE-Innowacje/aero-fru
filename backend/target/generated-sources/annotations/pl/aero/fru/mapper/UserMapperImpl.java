package pl.aero.fru.mapper;

import java.time.OffsetDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;
import pl.aero.fru.dto.user.UserListResponse;
import pl.aero.fru.dto.user.UserResponse;
import pl.aero.fru.entity.DictUserRole;
import pl.aero.fru.entity.User;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-31T10:46:30+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.6 (Microsoft)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User entity) {
        if ( entity == null ) {
            return null;
        }

        String roleName = null;
        Long id = null;
        String firstName = null;
        String lastName = null;
        String email = null;
        OffsetDateTime createdAt = null;
        OffsetDateTime updatedAt = null;

        roleName = entityRoleName( entity );
        id = entity.getId();
        firstName = entity.getFirstName();
        lastName = entity.getLastName();
        email = entity.getEmail();
        createdAt = entity.getCreatedAt();
        updatedAt = entity.getUpdatedAt();

        UserResponse userResponse = new UserResponse( id, firstName, lastName, email, roleName, createdAt, updatedAt );

        return userResponse;
    }

    @Override
    public UserListResponse toListResponse(User entity) {
        if ( entity == null ) {
            return null;
        }

        String roleName = null;
        Long id = null;
        String email = null;

        roleName = entityRoleName( entity );
        id = entity.getId();
        email = entity.getEmail();

        UserListResponse userListResponse = new UserListResponse( id, email, roleName );

        return userListResponse;
    }

    private String entityRoleName(User user) {
        DictUserRole role = user.getRole();
        if ( role == null ) {
            return null;
        }
        return role.getName();
    }
}
