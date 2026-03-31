package pl.aero.fru.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.aero.fru.dto.user.*;
import pl.aero.fru.entity.DictUserRole;
import pl.aero.fru.entity.User;
import pl.aero.fru.exception.BusinessRuleException;
import pl.aero.fru.exception.ResourceNotFoundException;
import pl.aero.fru.mapper.UserMapper;
import pl.aero.fru.repository.DictUserRoleRepository;
import pl.aero.fru.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DictUserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public List<UserListResponse> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toListResponse).toList();
    }

    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("User with email " + request.email() + " already exists");
        }

        DictUserRole role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("UserRole", request.roleId()));

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUser(id);

        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("User with email " + request.email() + " already exists");
        }

        DictUserRole role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("UserRole", request.roleId()));

        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setRole(role);

        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
