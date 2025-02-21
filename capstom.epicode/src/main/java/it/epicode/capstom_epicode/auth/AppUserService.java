package it.epicode.capstom_epicode.auth;

import it.epicode.capstom_epicode.db.pojo.Materia;
import it.epicode.capstom_epicode.db.repository.MateriaRepository;
import it.epicode.capstom_epicode.exceptions.BadRequestException;
import it.epicode.capstom_epicode.exceptions.ConflictException;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import it.epicode.capstom_epicode.exceptions.UnauthorizedException;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppUserService {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    VerificationTokenRepository verificationTokenRepository;

    @Autowired
    EmailService emailService;

    public AuthResponse registerAdmin(String username, String password, String nome, String cognome, String email, String whatsapp) throws MessagingException {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword(password);
        request.setNome(nome);
        request.setCognome(cognome);
        request.setEmail(email);
        request.setWhatsapp(whatsapp);
        request.setRuolo(UserRole.ROLE_ADMIN);
        return registerUser(request);
    }

    public AuthResponse registerMentor(String username, String password, String nome, String cognome, String email,
                                       List<MateriaRequest> materieRequests, String fasciaOrariaInizio, String fasciaOrariaFine, String whatsapp) throws MessagingException {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword(password);
        request.setNome(nome);
        request.setCognome(cognome);
        request.setEmail(email);
        request.setRuolo(UserRole.ROLE_MENTOR);
        request.setMaterie(materieRequests);
        request.setFasciaOrariaInizio(fasciaOrariaInizio);
        request.setFasciaOrariaFine(fasciaOrariaFine);
        request.setWhatsapp(whatsapp);
        return registerUser(request);
    }

    public AuthResponse registerStudent(String username, String password, String nome, String cognome, String email, String whatsapp) throws MessagingException {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword(password);
        request.setNome(nome);
        request.setCognome(cognome);
        request.setEmail(email);
        request.setWhatsapp(whatsapp);
        request.setRuolo(UserRole.ROLE_STUDENT);
        return registerUser(request);
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) throws MessagingException {
        if (appUserRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ConflictException("Username già in uso");
        }

        if (appUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email già in uso");
        }

        AppUser user = new AppUser();
        BeanUtils.copyProperties(request, user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setWhatsapp(request.getWhatsapp());
        user.setEmailVerificata(false);

        if (request.getRuolo() == UserRole.ROLE_MENTOR) {
            if (request.getMaterie() == null || request.getMaterie().isEmpty() ||
                    request.getFasciaOrariaInizio() == null || request.getFasciaOrariaFine() == null) {
                throw new BadRequestException("I campi 'materie', 'fasciaOrariaInizio' e 'fasciaOrariaFine' sono obbligatori per il ruolo MENTOR");
            }

            List<Materia> materieUtente = request.getMaterie().stream()
                    .map(req -> {
                        return materiaRepository.findByNomeAndLivello(req.getNome(), req.getLivello())
                                .orElseGet(() -> {
                                    Materia newMateria = new Materia();
                                    newMateria.setNome(req.getNome());
                                    newMateria.setLivello(req.getLivello());
                                    return materiaRepository.save(newMateria);
                                });
                    }).toList();

            user.setMaterie(materieUtente);

            user.setFasciaOrariaInizio(request.getFasciaOrariaInizio());
            user.setFasciaOrariaFine(request.getFasciaOrariaFine());
        } else if (request.getRuolo() == UserRole.ROLE_STUDENT) {
            // ... gestisci casi STUDENT
            user.setMaterie(null);
            user.setFasciaOrariaInizio(null);
            user.setFasciaOrariaFine(null);
        }

        AppUser savedUser = appUserRepository.save(user);

        VerificationToken verificationToken = new VerificationToken(savedUser);
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());

        return new AuthResponse("Registrazione completata. Controlla la tua email per verificare l'account.", null, true);
    }






    private Materia createMateriaFromRequest(MateriaRequest request) {
        Materia materia = materiaRepository.findByNomeAndLivello(request.getNome(), request.getLivello())
                .orElseGet(() -> {
                    Materia newMateria = new Materia();
                    BeanUtils.copyProperties(request, newMateria);
                    return newMateria;
                });
        return materia;
    }

    public AppUser findByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con username: " + username));
    }

    public AuthResponse authenticateUser(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AppUser user = loadUserByUsername(username);

            if (!user.getEmailVerificata()) {
                throw new UnauthorizedException("Email non verificata. Controlla la tua casella di posta.");
            }

            String token = jwtTokenUtil.generateToken(userDetails);
            boolean primoLogin = user.getPrimoLogin();
            return new AuthResponse(token, user, primoLogin);

        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Errore nell'autenticazione: " + e.getMessage());
        }
    }

    public AuthResponse refreshUserToken(String oldToken) {
        if (oldToken == null || !jwtTokenUtil.validateTokenWithoutUserDetails(oldToken)) {
            throw new UnauthorizedException("Token non valido o scaduto.");
        }

        String username = jwtTokenUtil.getUsernameFromToken(oldToken);

        AppUser user = loadUserByUsername(username);

        String newToken = jwtTokenUtil.generateTokenFromAppUser(user);

        boolean primoLogin = user.getPrimoLogin();
        return new AuthResponse(newToken, user, primoLogin);
    }

    public AppUser loadUserByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Utente non trovato con username: " + username));
    }

    public AppUser save(AppUser appUser) {
        try {
            return appUserRepository.save(appUser);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Dati non validi o duplicati: " + e.getMessage());
        }
    }
}
