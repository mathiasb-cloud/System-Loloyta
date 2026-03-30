package com.loloyta.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.loloyta.dto.RolResponse;
import com.loloyta.service.RolService;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin("*")
public class RolController {

    @Autowired
    private RolService rolService;

    @GetMapping
    public List<RolResponse> listar() {
        return rolService.listarVisibles();
    }
}