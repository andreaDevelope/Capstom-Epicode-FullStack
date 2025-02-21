package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.db.pojo.Favorite;
import it.epicode.capstom_epicode.db.repository.FavoriteRepository;
import it.epicode.capstom_epicode.exceptions.AlreadyExistsException;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    NotificationService notificationService;

    @Transactional
    public void addFavorite(Long studentId, Long mentorId) {
        if (favoriteRepository.findByStudentAndMentor(studentId, mentorId).isPresent()) {
            throw new AlreadyExistsException("Questo mentor è già nei preferiti!");
        }

        AppUser student = appUserRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Studente non trovato con ID: " + studentId));

        AppUser mentor = appUserRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor non trovato con ID: " + mentorId));

        Favorite favorite = new Favorite();
        favorite.setStudent(student);
        favorite.setMentor(mentor);
        favoriteRepository.save(favorite);

        System.out.println("⭐ Mentor " + mentorId + " aggiunto ai preferiti dallo studente " + studentId);

        // Notifica il mentor
        notificationService.notifyMentor(mentorId, "Hai un nuovo studente tra i tuoi preferiti!");
    }


    public AppUser getStudentByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Studente non trovato con username: " + username));
    }


    public List<AppUser> getFavorites(Long studentId) {
        return favoriteRepository.findFavoritesByStudentId(studentId);
    }

    @Transactional
    public void removeFavorite(Long studentId, Long mentorId) {
        if (favoriteRepository.findByStudentAndMentor(studentId, mentorId).isEmpty()) {
            throw new ResourceNotFoundException("Il mentor non è nei preferiti dello studente.");
        }
        favoriteRepository.deleteByStudentIdAndMentorId(studentId, mentorId);
    }
}
