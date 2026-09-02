package com.berksozcu.repository;

import com.berksozcu.entites.mail_log.MailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MailLogRepository extends JpaRepository<MailLog, Long> {
    Optional<MailLog> findFirstByCompanyId_IdOrderByIdDesc(Long companyId);
}
