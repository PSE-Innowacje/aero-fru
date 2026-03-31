package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "FRU_OP_CHANGE_HISTORY")
@Getter
@Setter
public class OperationChangeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "op_change_hist_seq")
    @SequenceGenerator(name = "op_change_hist_seq", sequenceName = "FRU_OP_CHANGE_HIST_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_id", nullable = false)
    private PlannedOperation operation;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "old_value", length = 4000)
    private String oldValue;

    @Column(name = "new_value", length = 4000)
    private String newValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", nullable = false)
    private User changedBy;

    @Column(name = "changed_at", insertable = false, updatable = false)
    private OffsetDateTime changedAt;
}
