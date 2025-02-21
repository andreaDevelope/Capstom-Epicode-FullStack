package it.epicode.capstom_epicode.web.controller;


import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.db.service.AvatarService;
import it.epicode.capstom_epicode.db.service.CloudinaryService;
import it.epicode.capstom_epicode.db.service.UserDataService;
import it.epicode.capstom_epicode.db.service.UserRoleService;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import it.epicode.capstom_epicode.web.dto.MentorUpdateRequest;
import it.epicode.capstom_epicode.web.dto.StudentUpdateRequest;
import it.epicode.capstom_epicode.web.dto.UploadAvatarRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/")
@PreAuthorize("isAuthenticated()")
public class UserDataController {

    @Autowired
    UserDataService userDataService;

    @Autowired
    AppUserRepository appUserRepository;

    @Autowired
    UserRoleService userRoleService;

    @Autowired
    CloudinaryService cloudinaryService;

    @Autowired
    AvatarService avatarService;

    @GetMapping("/mentor")
    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR')")
    public ResponseEntity<List<AppUser>> getAllMentor(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user){
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudent(username);
        return ResponseEntity.ok(userDataService.getAllMentor());
    }

    @GetMapping("/user/refresh/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AppUser> getUpdatedUser(@PathVariable String username) {
        AppUser user = userDataService.getUpdatedUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/mentors/matching/{studentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AppUser>> getMentorsWithCommonSubjects(@PathVariable Long studentId, @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfStudent(username);
        return ResponseEntity.ok(userDataService.getMentorsWithCommonSubjects(studentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    public ResponseEntity<AppUser> getById( @PathVariable Long id,@AuthenticationPrincipal org.springframework.security.core.userdetails.User user){
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);
        return ResponseEntity.ok(userDataService.findById(id));
    }

    @PutMapping(path = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @ModelAttribute UploadAvatarRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User authenticatedUser) {

        if (request.getFile().isEmpty()) {
            throw new IllegalArgumentException("Il file non può essere vuoto");
        }

        AppUser appUser = appUserRepository.findByUsername(authenticatedUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("⚠️ Utente non trovato con username: "
                        + authenticatedUser.getUsername() + ". Effettua il logout e rientra."));

        userRoleService.checkIfMentorOrStudentOrAdmin(appUser.getUsername());

        String folder = "societa-logo";
        Map<String, Object> result = cloudinaryService.uploader(request.getFile(), folder);
        String imageUrl = (String) result.get("url");

        avatarService.save(request, imageUrl);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Avatar aggiornato con successo!");
        response.put("imageUrl", imageUrl);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<AppUser> updateStudent(
            @RequestBody StudentUpdateRequest newStudent,
            @PathVariable Long id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {

        String username = user.getUsername();
        userRoleService.checkIfAdminOrStudent(username);

        return ResponseEntity.ok(userDataService.updateStudent(newStudent, id));
    }


    @PutMapping("/mentor/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<AppUser> updateMentor(@RequestBody MentorUpdateRequest newMentor,
                                                @PathVariable Long id,
                                                @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfAdminOrMentor(username);
        return ResponseEntity.ok(userDataService.updateMentor(newMentor, id));
    }




}
