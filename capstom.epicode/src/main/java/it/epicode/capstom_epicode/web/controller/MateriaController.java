package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.db.pojo.Materia;
import it.epicode.capstom_epicode.db.service.MateriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materie")
public class MateriaController {

    @Autowired
    private MateriaService materiaService;


    @GetMapping
    public ResponseEntity<List<Materia>> getAllMaterie() {
        List<Materia> materie = materiaService.findAll();
        return ResponseEntity.ok(materie);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Materia> getMateriaById(@PathVariable Long id) {
        Materia materia = materiaService.findById(id);
        return ResponseEntity.ok(materia);
    }



}

