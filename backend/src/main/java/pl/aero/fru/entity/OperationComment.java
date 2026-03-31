package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "FRU_OP_COMMENTS")
@Getter
@Setter
public class OperationComment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "op_comments_seq")
    @SequenceGenerator(name = "op_comments_seq", sequenceName = "FRU_OP_COMMENTS_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_id", nullable = false)
    private PlannedOperation operation;

    @Column(name = "comment_text", nullable = false, length = 500)
    private String commentText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
