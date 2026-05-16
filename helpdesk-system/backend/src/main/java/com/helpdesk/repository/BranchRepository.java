package com.helpdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.helpdesk.entity.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

    Optional<Branch> findByBranchNameIgnoreCase(String branchName);

    List<Branch> findByCityIgnoreCase(String city);

    boolean existsByBranchNameIgnoreCase(String branchName);
}
