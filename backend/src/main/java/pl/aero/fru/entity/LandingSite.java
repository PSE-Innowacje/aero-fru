package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "FRU_LANDING_SITES")
@Getter
@Setter
public class LandingSite {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "landing_sites_seq")
    @SequenceGenerator(name = "landing_sites_seq", sequenceName = "FRU_LANDING_SITES_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
