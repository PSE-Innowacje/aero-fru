package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_DICT_CREW_ROLES")
@Getter
@Setter
public class DictCrewRole {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dict_crew_roles_seq")
    @SequenceGenerator(name = "dict_crew_roles_seq", sequenceName = "FRU_DICT_CREW_ROLES_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}
