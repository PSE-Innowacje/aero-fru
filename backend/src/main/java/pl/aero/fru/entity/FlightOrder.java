package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "FRU_FLIGHT_ORDERS")
@Getter
@Setter
public class FlightOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "flight_orders_seq")
    @SequenceGenerator(name = "flight_orders_seq", sequenceName = "FRU_FLIGHT_ORDERS_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "order_number", insertable = false, updatable = false)
    private Long orderNumber;

    @Column(name = "planned_start_at", nullable = false)
    private OffsetDateTime plannedStartAt;

    @Column(name = "planned_landing_at", nullable = false)
    private OffsetDateTime plannedLandingAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pilot_id", nullable = false)
    private CrewMember pilot;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private DictFlightOrderStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "helicopter_id", nullable = false)
    private Helicopter helicopter;

    @Column(name = "crew_weight_kg", nullable = false)
    private Integer crewWeightKg;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "start_landing_site_id", nullable = false)
    private LandingSite startLandingSite;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "end_landing_site_id", nullable = false)
    private LandingSite endLandingSite;

    @Column(name = "estimated_route_km", nullable = false)
    private Integer estimatedRouteKm;

    @Column(name = "actual_start_at")
    private OffsetDateTime actualStartAt;

    @Column(name = "actual_landing_at")
    private OffsetDateTime actualLandingAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "FRU_FO_CREW_MEMBERS",
            joinColumns = @JoinColumn(name = "flight_order_id"),
            inverseJoinColumns = @JoinColumn(name = "crew_member_id")
    )
    private Set<CrewMember> crewMembers = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "FRU_FO_OPERATIONS",
            joinColumns = @JoinColumn(name = "flight_order_id"),
            inverseJoinColumns = @JoinColumn(name = "operation_id")
    )
    private Set<PlannedOperation> operations = new HashSet<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
