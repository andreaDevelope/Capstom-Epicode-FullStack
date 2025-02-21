package it.epicode.capstom_epicode.web.dto;

import it.epicode.capstom_epicode.db.pojo.Avatar;
import it.epicode.capstom_epicode.db.pojo.Materia;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class StudentUpdateRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String email;

    @NotBlank
    private String nome;

    @NotBlank
    private String cognome;

    @NotBlank
    private String whatsapp;

    private List<Materia> materie;
}
