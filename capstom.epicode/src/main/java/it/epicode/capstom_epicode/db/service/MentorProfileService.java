package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.db.pojo.MentorProfile;
import it.epicode.capstom_epicode.db.repository.MentorProfileRepository;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import it.epicode.capstom_epicode.exceptions.UnauthorizedException;
import it.epicode.capstom_epicode.web.dto.MentorDetailsResponse;
import it.epicode.capstom_epicode.web.dto.MentorProfileRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MentorProfileService {

    @Autowired
    private MentorProfileRepository mentorProfileRepository;

    @Autowired
    AppUserRepository appUserRepository;

    public MentorProfile getOrCreateProfileByMentorId(Long mentorId) {
        return mentorProfileRepository.findByMentorId(mentorId)
                .orElseGet(() -> {
                    MentorProfile newProfile = new MentorProfile();
                    AppUser mentor = new AppUser();
                    mentor.setId(mentorId);
                    newProfile.setMentor(mentor);

                    newProfile.setBio("Inserisci una breve descrizione su di te.");
                    newProfile.setSpecializzazione("Non specificata");
                    newProfile.setLinkedin(null);
                    newProfile.setWebsite(null);
                    newProfile.setEsperienza(null);
                    newProfile.setCompensoPerOra(0);

                    return mentorProfileRepository.save(newProfile);
                });
    }


    public MentorProfile updateProfile(Long mentorId, MentorProfileRequest profileData, AppUser currentUser) {
        MentorProfile profile = mentorProfileRepository.findByMentorId(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Profilo non trovato per il mentor con ID: " + mentorId));

        if (!profile.getMentor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Non hai il permesso di modificare questo profilo.");
        }

        profile.setBio(profileData.getBio());
        profile.setSpecializzazione(profileData.getSpecializzazione());
        profile.setLinkedin(profileData.getLinkedin());
        profile.setWebsite(profileData.getWebsite());
        profile.setEsperienza(profileData.getEsperienza());

        return mentorProfileRepository.save(profile);
    }

    public MentorProfile getMentorProfileByMentorId(Long mentorId) {
        return mentorProfileRepository.findMentorProfileByMentorId(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Profilo non trovato per il mentor con ID: " + mentorId));
    }

    @Transactional
    public MentorDetailsResponse getMentorProfileByUsername(String username) {
        MentorProfile profile = mentorProfileRepository.findMentorProfileByUsername(username)
                .orElseGet(() -> {
                    AppUser mentor = appUserRepository.findByUsername(username)
                            .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato con username: " + username));

                    MentorProfile newProfile = new MentorProfile();
                    newProfile.setMentor(mentor);
                    newProfile.setBio("Inserisci una breve descrizione su di te.");
                    newProfile.setSpecializzazione("Non specificata");
                    newProfile.setLinkedin(null);
                    newProfile.setWebsite(null);
                    newProfile.setEsperienza(null);
                    newProfile.setCompensoPerOra(0);

                    return mentorProfileRepository.save(newProfile);
                });

        return new MentorDetailsResponse(
                profile.getMentor().getId(),
                profile.getMentor().getNome(),
                profile.getMentor().getCognome(),
                profile.getMentor().getUsername(),
                profile.getMentor().getEmail(),
                profile.getMentor().getWhatsapp(),
                profile.getMentor().getFasciaOrariaInizio(),
                profile.getMentor().getFasciaOrariaFine(),
                (profile.getMentor().getAvatar() != null) ? profile.getMentor().getAvatar().getPath() : null, // Avatar path
                profile.getBio(),
                profile.getSpecializzazione(),
                profile.getLinkedin(),
                profile.getWebsite(),
                profile.getEsperienza(),
                profile.getCompensoPerOra()
        );
    }



    public MentorProfile updateSingleField(Long mentorId, String fieldName, String fieldValue, AppUser currentUser) {
        MentorProfile profile = mentorProfileRepository.findByMentorId(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Profilo non trovato per il mentor con ID: " + mentorId));

        if (!profile.getMentor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Non hai il permesso di modificare questo profilo.");
        }

        switch (fieldName) {
            case "bio":
                profile.setBio(fieldValue);
                break;
            case "specializzazione":
                profile.setSpecializzazione(fieldValue);
                break;
            case "linkedin":
                profile.setLinkedin(fieldValue);
                break;
            case "website":
                profile.setWebsite(fieldValue);
                break;
            case "esperienza":
                profile.setEsperienza(fieldValue);
                break;
            case "compensoPerOra":
                profile.setCompensoPerOra(Double.parseDouble(fieldValue));
                break;
            default:
                throw new IllegalArgumentException("Campo non valido: " + fieldName);
        }

        return mentorProfileRepository.save(profile);
    }

}
