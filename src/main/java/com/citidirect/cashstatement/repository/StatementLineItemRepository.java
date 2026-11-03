package com.citidirect.cashstatement.repository;

import com.citidirect.cashstatement.entity.StatementLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatementLineItemRepository extends JpaRepository<StatementLineItem, String> {
    List<StatementLineItem> findByReportId(String reportId);
}
