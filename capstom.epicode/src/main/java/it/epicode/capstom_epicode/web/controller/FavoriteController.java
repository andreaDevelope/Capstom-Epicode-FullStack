package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.db.service.FavoriteService;
import it.epicode.capstom_epicode.db.service.UserRoleService;
import it.epicode.capstom_epicode.web.dto.FavoriteAddRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("isAuthenticated()")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private UserRoleService userRoleService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> addFavorite(
            @RequestBody FavoriteAddRequest request,
            @AuthenticationPrincipal User user) {

        String username = user.getUsername();
        userRoleService.checkIfStudent(username);

        AppUser student = favoriteService.getStudentByUsername(username);
        favoriteService.addFavorite(student.getId(), request.getMentorId());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mentor aggiunto ai preferiti con successo!");

        return ResponseEntity.ok(response);
    }


    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AppUser>> getFavorites(@AuthenticationPrincipal User user) {
        String username = user.getUsername();
        userRoleService.checkIfStudent(username);

        AppUser student = favoriteService.getStudentByUsername(username);
        List<AppUser> favorites = favoriteService.getFavorites(student.getId());

        return ResponseEntity.ok(favorites);
    }

    @DeleteMapping("/{mentorId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @PathVariable Long mentorId,
            @AuthenticationPrincipal User user) {

        String username = user.getUsername();
        userRoleService.checkIfStudent(username);

        AppUser student = favoriteService.getStudentByUsername(username);
        favoriteService.removeFavorite(student.getId(), mentorId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mentor rimosso dai preferiti con successo!");

        return ResponseEntity.ok(response);
    }

}
