package it.epicode.capstom_epicode.auth;

import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AppUserService appUserService;

    private final VerificationTokenRepository verificationTokenRepository;

    private final AppUserRepository appUserRepository;

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Token non valido o scaduto"));

        AppUser user = verificationToken.getUser();

        if (user.getEmailVerificata()) {
            return ResponseEntity.badRequest().body("Email già verificata.");
        }

        user.setEmailVerificata(true);
        appUserRepository.save(user);
        verificationTokenRepository.delete(verificationToken);

        return ResponseEntity.ok("Email verificata con successo. Ora puoi accedere.");
    }


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest registerRequest) throws MessagingException {
        AuthResponse authResponse = appUserService.registerUser(registerRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = appUserService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String oldToken) {
        if (oldToken.startsWith("Bearer ")) {
            oldToken = oldToken.substring(7);
        }

        AuthResponse authResponse = appUserService.refreshUserToken(oldToken);

        return ResponseEntity.ok(authResponse);
    }

}
