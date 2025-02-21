package it.epicode.capstom_epicode.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MentorDetailsResponse {
    private Long id;
    private String nome;
    private String cognome;
    private String username;
    private String email;
    private String whatsapp;
    private String fasciaOrariaInizio;
    private String fasciaOrariaFine;
    private String avatarPath;

    private String bio;
    private String specializzazione;
    private String linkedin;
    private String website;
    private String esperienza;
    private double compensoPerOra;
}
