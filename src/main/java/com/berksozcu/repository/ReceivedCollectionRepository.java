package com.berksozcu.repository;

import com.berksozcu.entites.ReceivedCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceivedCollectionRepository extends JpaRepository<ReceivedCollection, Long> {
}
