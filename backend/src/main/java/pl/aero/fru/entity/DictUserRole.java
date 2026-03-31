package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_DICT_USER_ROLES")
@Getter
@Setter
public class DictUserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dict_user_roles_seq")
    @SequenceGenerator(name = "dict_user_roles_seq", sequenceName = "FRU_DICT_USER_ROLES_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}
