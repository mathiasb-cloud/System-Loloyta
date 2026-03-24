package com.loloyta.service.impl;

import com.loloyta.model.MotivoMerma;
import com.loloyta.repository.MotivoMermaRepository;
import com.loloyta.service.MotivoMermaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MotivoMermaServiceImpl implements MotivoMermaService {

    private final MotivoMermaRepository repository;

    public MotivoMermaServiceImpl(MotivoMermaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<MotivoMerma> listar() {
        return repository.findAll();
    }

    @Override
    public MotivoMerma buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo de merma no encontrado"));
    }

    @Override
    public MotivoMerma guardar(MotivoMerma motivo) {
        return repository.save(motivo);
    }

    @Override
    public MotivoMerma actualizar(Long id, MotivoMerma motivoActualizado) {
        MotivoMerma motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo de merma no encontrado"));

        motivo.setNombre(motivoActualizado.getNombre());
        motivo.setDescripcion(motivoActualizado.getDescripcion());

        return repository.save(motivo);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}