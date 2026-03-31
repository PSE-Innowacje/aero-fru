package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "FRU_CREW_MEMBERS")
@Getter
@Setter
public class CrewMember {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "crew_members_seq")
    @SequenceGenerator(name = "crew_members_seq", sequenceName = "FRU_CREW_MEMBERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "weight_kg", nullable = false)
    private Integer weightKg;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private DictCrewRole role;

    @Column(name = "pilot_license_number", length = 30)
    private String pilotLicenseNumber;

    @Column(name = "license_valid_until")
    private LocalDate licenseValidUntil;

    @Column(name = "training_valid_until", nullable = false)
    private LocalDate trainingValidUntil;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
