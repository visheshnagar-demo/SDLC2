package com.citidirect.cashstatement.masterdata.repository;

import com.citidirect.cashstatement.masterdata.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {

    @Query("SELECT b FROM Branch b WHERE LOWER(b.branchNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.branchName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Branch> searchBranches(@Param("query") String query);
}
