package pl.aero.fru.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OracleContextService {

    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.MANDATORY)
    public void setUserId(Long userId) {
        entityManager.createNativeQuery("CALL FRU_CTX_PKG.set_user_id(:userId)")
                .setParameter("userId", userId)
                .executeUpdate();
    }
}
