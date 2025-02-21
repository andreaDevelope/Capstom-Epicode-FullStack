package it.epicode.capstom_epicode.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MentorProfileRequest {

    @Size(max = 500, message = "La bio può contenere al massimo 500 caratteri")
    private String bio;

    @NotBlank(message = "La specializzazione è obbligatoria")
    @Size(max = 100, message = "La specializzazione può contenere al massimo 100 caratteri")
    private String specializzazione;

    @Size(max = 255, message = "Il link di LinkedIn non può superare 255 caratteri")
    private String linkedin;

    @Size(max = 255, message = "Il link del sito web non può superare 255 caratteri")
    private String website;

    @Size(max = 100, message = "Il campo esperienza può contenere al massimo 100 caratteri")
    private String esperienza;

    private double compensoPerOra;
}

