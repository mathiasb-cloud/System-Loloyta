package com.loloyta.repository;

import com.loloyta.model.DetalleMerma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface DetalleMermaRepository extends JpaRepository<DetalleMerma, Long> {

    List<DetalleMerma> findByMermaId(Long mermaId);

    @Transactional
    long deleteByMermaId(Long mermaId);
}