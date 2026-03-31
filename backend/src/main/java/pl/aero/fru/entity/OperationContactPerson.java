package pl.aero.fru.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "FRU_OP_CONTACT_PERSONS")
@Getter
@Setter
public class OperationContactPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "op_contact_persons_seq")
    @SequenceGenerator(name = "op_contact_persons_seq", sequenceName = "FRU_OP_CONTACT_PERSONS_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operation_id", nullable = false)
    private PlannedOperation operation;

    @Column(nullable = false, length = 100)
    private String email;
}
