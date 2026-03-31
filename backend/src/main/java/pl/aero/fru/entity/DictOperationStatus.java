package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_DICT_OPERATION_STATUSES")
@Getter
@Setter
public class DictOperationStatus {

    @Id
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}
