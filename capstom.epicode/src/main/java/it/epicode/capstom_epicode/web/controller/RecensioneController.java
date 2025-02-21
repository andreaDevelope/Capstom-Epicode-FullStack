package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.db.pojo.Recensione;
import it.epicode.capstom_epicode.db.service.RecensioneService;
import it.epicode.capstom_epicode.db.service.UserRoleService;
import it.epicode.capstom_epicode.web.dto.RecensioneRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/recensioni")
public class RecensioneController {

    @Autowired
    UserRoleService userRoleService;

    @Autowired
    RecensioneService recensioneService;

    @Autowired
    AppUserRepository appUserRepository;

    @PreAuthorize("hasAnyRole('STUDENT')")
    @PostMapping("/aggiungi/{studenteId}")
    public ResponseEntity<Recensione> aggiungiRecensione(
            @PathVariable Long studenteId,
            @Valid @RequestBody RecensioneRequest dto,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user
            ) {
        String username = user.getUsername();
        userRoleService.checkIfStudent(username);
        Recensione nuovaRecensione = recensioneService.aggiungiRecensione(studenteId, dto);
        return ResponseEntity.ok(nuovaRecensione);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    @GetMapping("/media/{mentorId}")
    public ResponseEntity<Double> getMediaRecensioni(@PathVariable Long mentorId,  @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);
        Double media = recensioneService.getMediaRecensioni(mentorId);
        return ResponseEntity.ok(media);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    @GetMapping("/{mentorId}")
    public ResponseEntity<List<Recensione>> getRecensioniPerMentor(@PathVariable Long mentorId,  @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);
        List<Recensione> recensioni = recensioneService.getRecensioniPerMentor(mentorId);
        return ResponseEntity.ok(recensioni);
    }
}

