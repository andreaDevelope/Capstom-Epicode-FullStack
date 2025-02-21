package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.auth.UserRole;
import it.epicode.capstom_epicode.exceptions.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService {
    @Autowired
    private AppUserRepository appUserRepository;

    public String checkIfAdmin(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_ADMIN) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un amministratore");
        }
    }

    public String checkIfStudent(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_STUDENT) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è uno studente");
        }
    }

    public String checkIfMentor(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_MENTOR) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un mentor");
        }
    }

    public String checkIfMentorOrStudentOrAdmin(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_MENTOR || appUser.getRuolo() == UserRole.ROLE_STUDENT || appUser.getRuolo() == UserRole.ROLE_ADMIN) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un mentor");
        }
    }

    public String checkIfMentorOrStudent(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_MENTOR || appUser.getRuolo() == UserRole.ROLE_STUDENT) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un mentor");
        }
    }

    public String checkIfAdminOrStudent(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_ADMIN || appUser.getRuolo() == UserRole.ROLE_STUDENT) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un mentor");
        }
    }

    public String checkIfAdminOrMentor(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Utente non trovato"));

        if (appUser.getRuolo() == UserRole.ROLE_ADMIN || appUser.getRuolo() == UserRole.ROLE_MENTOR) {
            return appUser.getUsername();
        } else {
            throw new UnauthorizedException("Accesso negato: l'utente non è un mentor");
        }
    }
}
