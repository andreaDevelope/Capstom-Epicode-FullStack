package it.epicode.capstom_epicode.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UploadAvatarRequest {
    @NotNull(message = "Il file è obbligatorio")
    private MultipartFile file;

    @NotNull(message = "Il clienteId è obbligatorio")
    private Long userId;
}
