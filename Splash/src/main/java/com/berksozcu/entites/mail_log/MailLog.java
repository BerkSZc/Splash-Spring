package com.berksozcu.entites.mail_log;

import com.berksozcu.entites.company.Company;
import com.berksozcu.entites.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mail_log", schema = "splash")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company companyId;

    @Column(name = "recipient_to", nullable = false, length = 500)
    private String to;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;
}