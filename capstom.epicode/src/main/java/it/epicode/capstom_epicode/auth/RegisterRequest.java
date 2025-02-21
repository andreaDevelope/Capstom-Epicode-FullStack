package it.epicode.capstom_epicode.auth;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    @NotNull
    private String username;

    @NotNull
    private String password;

    @NotNull
    private String nome;

    @NotNull
    private String cognome;

    @NotNull
    private String email;

    private String fasciaOrariaInizio; // Opzionale per STUDENT

    private String fasciaOrariaFine;

    @NotNull
    private UserRole ruolo;

    private List<MateriaRequest> materie;

    @NotNull
    private String whatsapp;
}
