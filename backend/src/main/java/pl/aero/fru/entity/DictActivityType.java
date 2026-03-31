package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_DICT_ACTIVITY_TYPES")
@Getter
@Setter
public class DictActivityType {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "dict_activity_types_seq")
    @SequenceGenerator(name = "dict_activity_types_seq", sequenceName = "FRU_DICT_ACTIVITY_TYPES_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}
