package com.loloyta.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class VistaController {

    @GetMapping("/ordenes")
    public String verOrdenes() {
        return "ordenes";
    }
}
