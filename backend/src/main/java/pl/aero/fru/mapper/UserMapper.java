package pl.aero.fru.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pl.aero.fru.dto.user.UserListResponse;
import pl.aero.fru.dto.user.UserResponse;
import pl.aero.fru.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "role.name", target = "roleName")
    UserResponse toResponse(User entity);

    @Mapping(source = "role.name", target = "roleName")
    UserListResponse toListResponse(User entity);
}
