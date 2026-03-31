package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_DICT_FLIGHT_ORDER_STATUSES")
@Getter
@Setter
public class DictFlightOrderStatus {

    @Id
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
}
