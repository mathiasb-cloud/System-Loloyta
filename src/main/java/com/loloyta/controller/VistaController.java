package com.loloyta.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class VistaController {

    @GetMapping("/ordenes")
    public String verOrdenes() {
        return "ordenes";
    }

    @GetMapping("/stock")
    public String verStock(){return "stock";}

    @GetMapping("/index")
    public String verIndex(){return "index";}

    @GetMapping("/movimientos")
    public String verMovimientos(){return "movimientos";}
    
    @GetMapping("/salidas")
    public String salidas() {
        return "salidas"; 
    }


}
