package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.auth.UserRole;
import it.epicode.capstom_epicode.db.pojo.Materia;
import it.epicode.capstom_epicode.db.pojo.MentorProfile;
import it.epicode.capstom_epicode.db.repository.MateriaRepository;
import it.epicode.capstom_epicode.db.repository.MentorProfileRepository;
import it.epicode.capstom_epicode.exceptions.ConflictException;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import it.epicode.capstom_epicode.web.dto.MentorDetailsResponse;
import it.epicode.capstom_epicode.web.dto.MentorUpdateRequest;
import it.epicode.capstom_epicode.web.dto.StudentUpdateRequest;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;


import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Validated
@Service
public class UserDataService {
    @Autowired
    AppUserRepository appUserRepository;

    @Autowired
    CloudinaryService cloudinaryService;

    @Autowired
    MateriaRepository materiaRepository;

    @Autowired
    MentorProfileRepository mentorProfileRepository;

    public List<AppUser> getAllMentor(){
        return appUserRepository.findByRuolo(UserRole.ROLE_MENTOR);
    }

    public List<AppUser> getMentorsWithCommonSubjects(Long studentId) {
        return appUserRepository.findMentorsWithCommonSubjects(studentId);
    }

    @Transactional
    public AppUser updateMentor(@Valid MentorUpdateRequest newMentor, Long id) {
        AppUser mentor = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor con ID " + id + " non trovato."));

        Optional<AppUser> existingUsernameUser = appUserRepository.findByUsername(newMentor.getUsername());
        if (existingUsernameUser.isPresent() && !existingUsernameUser.get().getId().equals(id)) {
            throw new ConflictException("Username già in uso.");
        }

        Optional<AppUser> existingEmailUser = appUserRepository.findByEmail(newMentor.getEmail());
        if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(id)) {
            throw new ConflictException("Email già in uso.");
        }

        BeanUtils.copyProperties(newMentor, mentor, "materie");

        mentor.getMaterie().clear();

        if (newMentor.getMaterie() != null) {
            for (Materia materiaRequest : newMentor.getMaterie()) {
                String nomeMateria = materiaRequest.getNome().trim().toLowerCase();
                String livelloMateria = materiaRequest.getLivello().trim().toLowerCase();

                Materia materiaEsistente = materiaRepository.findByNomeAndLivello(nomeMateria, livelloMateria)
                        .orElseGet(() -> {
                            Materia newMateria = new Materia();
                            newMateria.setNome(nomeMateria);
                            newMateria.setLivello(livelloMateria);
                            return materiaRepository.save(newMateria);
                        });

                if (!mentor.getMaterie().contains(materiaEsistente)) {
                    mentor.getMaterie().add(materiaEsistente);
                }
            }
        }

        return appUserRepository.save(mentor);
    }

    @Transactional
    public AppUser getUpdatedUserByUsername(String username) {
        return appUserRepository.findUpdatedUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con username: " + username));
    }

    public AppUser findById(Long id){
        return appUserRepository.findById(id).get();
    }

    @Transactional
    public AppUser updateStudent(@Valid StudentUpdateRequest newStudent, Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studente con ID " + id + " non trovato."));

        Optional<AppUser> existingUsernameUser = appUserRepository.findByUsername(newStudent.getUsername());
        if (existingUsernameUser.isPresent() && !existingUsernameUser.get().getId().equals(id)) {
            throw new ConflictException("Username già in uso.");
        }

        Optional<AppUser> existingEmailUser = appUserRepository.findByEmail(newStudent.getEmail());
        if (existingEmailUser.isPresent() && !existingEmailUser.get().getId().equals(id)) {
            throw new ConflictException("Email già in uso.");
        }

        BeanUtils.copyProperties(newStudent, user, "id", "materie");

        if (newStudent.getMaterie() != null) {
            user.getMaterie().clear();
            for (Materia materia : newStudent.getMaterie()) {
                Materia materiaEsistente = materiaRepository.findByNomeAndLivello(materia.getNome(), materia.getLivello())
                        .orElseGet(() -> materiaRepository.save(materia));
                user.getMaterie().add(materiaEsistente);
            }

            if (user.getPrimoLogin()) {
                user.setPrimoLogin(false);
            }
        }

        return appUserRepository.save(user);
    }

    public MentorDetailsResponse getMentorDetailsById(Long mentorId) {
        AppUser mentor = appUserRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor con ID " + mentorId + " non trovato."));

        MentorProfile profile = mentorProfileRepository.findByMentorId(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Profilo non trovato per il mentor con ID " + mentorId));

        MentorDetailsResponse response = new MentorDetailsResponse();
        response.setId(mentor.getId());
        response.setNome(mentor.getNome());
        response.setCognome(mentor.getCognome());
        response.setUsername(mentor.getUsername());
        response.setEmail(mentor.getEmail());
        response.setWhatsapp(mentor.getWhatsapp());
        response.setFasciaOrariaInizio(mentor.getFasciaOrariaInizio());
        response.setFasciaOrariaFine(mentor.getFasciaOrariaFine());
        response.setAvatarPath(mentor.getAvatar().getPath());

        response.setBio(profile.getBio());
        response.setSpecializzazione(profile.getSpecializzazione());
        response.setLinkedin(profile.getLinkedin());
        response.setWebsite(profile.getWebsite());
        response.setEsperienza(profile.getEsperienza());
        response.setCompensoPerOra(profile.getCompensoPerOra());

        return response;
    }
}
