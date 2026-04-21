package com.rumour.app.repository;

import com.rumour.app.model.Message;
import com.rumour.app.model.Report;
import com.rumour.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByMessageAndReportedBy(Message message, User reportedBy);
    List<Report> findByMessage(Message message);
    List<Report> findAll();
}