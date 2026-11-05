package com.farmconnect.modules.wallet.repository;

import com.farmconnect.modules.wallet.model.TransactionType;
import com.farmconnect.modules.wallet.model.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<WalletTransaction> findByUserId(Long userId, Pageable pageable);
    Page<WalletTransaction> findByUserIdAndType(Long userId, TransactionType type, Pageable pageable);
    Optional<WalletTransaction> findByRazorpayPaymentId(String razorpayPaymentId);
}
