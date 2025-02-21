package it.epicode.capstom_epicode.web.dto;

import it.epicode.capstom_epicode.db.pojo.Materia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MentorUpdateRequest {

    @NotBlank(message = "il campo username non può essere vuoto")
    private String username;

    @NotBlank(message = "il campo password non può essere vuoto")
    private String password;

    @NotBlank(message = "il campo email non può essere vuoto")
    private String email;

    @NotBlank(message = "il campo nome non può essere vuoto")
    private String nome;

    @NotBlank(message = "il campo cognome non può essere vuoto")
    private String cognome;

    @NotBlank(message = "il campo whatsapp non può essere vuoto")
    private String whatsapp;

    @NotBlank(message = "il campo fascia oraria non può essere vuoto")
    private String fasciaOrariaInizio;

    @NotBlank(message = "il campo fascia oraria non può essere vuoto")
    private String fasciaOrariaFine;

    @NotNull(message = "il campo materie non può essere vuoto")
    private List<Materia> materie;
}
