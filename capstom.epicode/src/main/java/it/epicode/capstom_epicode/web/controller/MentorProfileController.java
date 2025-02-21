package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserService;
import it.epicode.capstom_epicode.db.pojo.MentorProfile;
import it.epicode.capstom_epicode.db.service.MentorProfileService;
import it.epicode.capstom_epicode.db.service.UserDataService;
import it.epicode.capstom_epicode.db.service.UserRoleService;
import it.epicode.capstom_epicode.web.dto.MentorDetailsResponse;
import it.epicode.capstom_epicode.web.dto.MentorProfileRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;



@PreAuthorize("isAuthenticated()")
@RestController
@RequestMapping("/api/mentor-profile")
public class MentorProfileController {

    @Autowired
    MentorProfileService mentorProfileService;

    @Autowired
    UserRoleService userRoleService;

    @Autowired
    AppUserService appUserService;

    @Autowired
    UserDataService userDataService;


    @PreAuthorize("hasAnyRole('MENTOR', 'STUDENT', 'ADMIN')")
    @GetMapping("/{mentorId}/or-create")
    public ResponseEntity<MentorProfile> getProfile(@PathVariable Long mentorId, @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);
        MentorProfile profile = mentorProfileService.getOrCreateProfileByMentorId(mentorId);
        return ResponseEntity.ok(profile);
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    @GetMapping("/details/{mentorId}")
    public ResponseEntity<MentorDetailsResponse> getMentorDetails(@PathVariable Long mentorId, @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);
        MentorDetailsResponse response = userDataService.getMentorDetailsById(mentorId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'STUDENT', 'ADMIN')")
    @GetMapping("/username/{username}")
    public ResponseEntity<MentorDetailsResponse> getMentorProfileByUsername(@PathVariable String username) {
        MentorDetailsResponse profile = mentorProfileService.getMentorProfileByUsername(username);
        return ResponseEntity.ok(profile);
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'STUDENT', 'ADMIN')")
    @GetMapping("/{mentorId}")
    public ResponseEntity<MentorProfile> getMentorProfile(@PathVariable Long mentorId, @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        String username = user.getUsername();
        userRoleService.checkIfMentorOrStudentOrAdmin(username);

        MentorProfile profile = mentorProfileService.getMentorProfileByMentorId(mentorId);
        return ResponseEntity.ok(profile);
    }

    @PreAuthorize("hasRole('MENTOR')")
    @PutMapping("/{mentorId}")
    public ResponseEntity<MentorProfile> updateProfile(
            @PathVariable Long mentorId,
            @Valid @RequestBody MentorProfileRequest profileRequest,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {

        String username = user.getUsername();
        userRoleService.checkIfMentor(username);

        AppUser appUser = appUserService.findByUsername(username);

        MentorProfile updatedProfile = mentorProfileService.updateProfile(mentorId, profileRequest, appUser);
        return ResponseEntity.ok(updatedProfile);
    }

    @PreAuthorize("hasRole('MENTOR')")
    @PatchMapping("/{mentorId}/update-field")
    public ResponseEntity<MentorProfile> updateSingleField(
            @PathVariable Long mentorId,
            @RequestParam String fieldName,
            @RequestParam String fieldValue,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {

        String username = user.getUsername();
        userRoleService.checkIfMentor(username);
        AppUser appUser = appUserService.findByUsername(username);

        MentorProfile updatedProfile = mentorProfileService.updateSingleField(mentorId, fieldName, fieldValue, appUser);
        return ResponseEntity.ok(updatedProfile);
    }

}
