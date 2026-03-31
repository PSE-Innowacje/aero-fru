package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "FRU_PLANNED_OPERATIONS")
@Getter
@Setter
public class PlannedOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "planned_ops_seq")
    @SequenceGenerator(name = "planned_ops_seq", sequenceName = "FRU_PLANNED_OPS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "operation_number", insertable = false, updatable = false)
    private Long operationNumber;

    @Column(name = "order_project_number", nullable = false, length = 30)
    private String orderProjectNumber;

    @Column(name = "short_description", nullable = false, length = 100)
    private String shortDescription;

    @Lob
    @Column(name = "kml_points", nullable = false)
    private byte[] kmlPoints;

    @Column(name = "proposed_date_earliest")
    private LocalDate proposedDateEarliest;

    @Column(name = "proposed_date_latest")
    private LocalDate proposedDateLatest;

    @Column(name = "additional_info", length = 500)
    private String additionalInfo;

    @Column(name = "route_km", nullable = false)
    private Integer routeKm;

    @Column(name = "planned_date_earliest")
    private LocalDate plannedDateEarliest;

    @Column(name = "planned_date_latest")
    private LocalDate plannedDateLatest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private DictOperationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "introduced_by_user_id", nullable = false)
    private User introducedBy;

    @Column(name = "post_realization_notes", length = 500)
    private String postRealizationNotes;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "FRU_OP_ACTIVITY_TYPES",
            joinColumns = @JoinColumn(name = "operation_id"),
            inverseJoinColumns = @JoinColumn(name = "activity_type_id")
    )
    private Set<DictActivityType> activityTypes = new HashSet<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OperationContactPerson> contactPersons = new ArrayList<>();

    @OneToMany(mappedBy = "operation", cascade = CascadeType.ALL)
    @OrderBy("createdAt ASC")
    private List<OperationComment> comments = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
