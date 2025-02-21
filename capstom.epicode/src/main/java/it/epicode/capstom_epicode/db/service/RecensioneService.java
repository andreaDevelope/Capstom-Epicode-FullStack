package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.auth.UserRole;
import it.epicode.capstom_epicode.db.pojo.Recensione;
import it.epicode.capstom_epicode.db.repository.RecensioneRepository;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import it.epicode.capstom_epicode.exceptions.ConflictException;
import it.epicode.capstom_epicode.exceptions.BadRequestException;
import it.epicode.capstom_epicode.web.dto.RecensioneRequest;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecensioneService {

    private final RecensioneRepository recensioneRepository;
    private final AppUserRepository appUserRepository;

    public RecensioneService(RecensioneRepository recensioneRepository, AppUserRepository appUserRepository) {
        this.recensioneRepository = recensioneRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public Recensione aggiungiRecensione(Long studenteId, RecensioneRequest dto) {
        AppUser mentor = appUserRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor non trovato con ID: " + dto.getMentorId()));

        AppUser studente = appUserRepository.findById(studenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Studente non trovato con ID: " + studenteId));

        if (mentor.getRuolo() != UserRole.ROLE_MENTOR) {
            throw new BadRequestException("L'utente selezionato non è un mentor.");
        }

        Optional<Recensione> recensioneEsistente = recensioneRepository.findByMentorIdAndStudenteId(mentor.getId(), studente.getId());
        if (recensioneEsistente.isPresent()) {
            throw new ConflictException("Hai già lasciato una recensione per questo mentor.");
        }

        Recensione recensione = new Recensione();
        recensione.setMentor(mentor);
        recensione.setStudente(studente);
        recensione.setStelle(dto.getStelle());
        recensione.setCommento(dto.getCommento());
        recensione.setDataRecensione(LocalDateTime.now());

        return recensioneRepository.save(recensione);
    }

    public Double getMediaRecensioni(Long mentorId) {
        appUserRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor non trovato con ID: " + mentorId));

        Double media = recensioneRepository.getMediaStelleByMentorId(mentorId);
        return media != null ? media : 0.0;
    }

    public List<Recensione> getRecensioniPerMentor(Long mentorId) {
        return recensioneRepository.findByMentorId(mentorId);
    }
}

