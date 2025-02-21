package it.epicode.capstom_epicode.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecensioneRequest{

    @NotNull(message = "Il mentor ID è obbligatorio")
    private Long mentorId;

    @NotNull(message = "Il numero di stelle è obbligatorio")
    @Min(value = 0, message = "Il valore minimo per le stelle è 0")
    @Max(value = 5, message = "Il valore massimo per le stelle è 5")
    private Double stelle;

    private String commento;
}

