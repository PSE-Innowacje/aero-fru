package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "FRU_HELICOPTERS")
@Getter
@Setter
public class Helicopter {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "helicopters_seq")
    @SequenceGenerator(name = "helicopters_seq", sequenceName = "FRU_HELICOPTERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "registration_number", nullable = false, length = 30, unique = true)
    private String registrationNumber;

    @Column(name = "helicopter_type", nullable = false, length = 100)
    private String helicopterType;

    @Column(length = 100)
    private String description;

    @Column(name = "max_crew_members", nullable = false)
    private Integer maxCrewMembers;

    @Column(name = "max_crew_weight_kg", nullable = false)
    private Integer maxCrewWeightKg;

    @Column(nullable = false, length = 10)
    private String status;

    @Column(name = "inspection_valid_until")
    private LocalDate inspectionValidUntil;

    @Column(name = "range_km", nullable = false)
    private Integer rangeKm;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
