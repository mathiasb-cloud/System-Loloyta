package com.loloyta.repository;

import com.loloyta.model.DetalleMerma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetalleMermaRepository extends JpaRepository<DetalleMerma, Long> {

    List<DetalleMerma> findByMermaId(Long mermaId);

    void deleteByMermaId(Long mermaId);
}