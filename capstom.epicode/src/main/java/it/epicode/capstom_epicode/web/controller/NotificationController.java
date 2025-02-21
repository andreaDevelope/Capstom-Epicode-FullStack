package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.db.pojo.Notification;
import it.epicode.capstom_epicode.db.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/notify")
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            Long mentorId = ((Number) request.get("mentorId")).longValue();
            String message = (String) request.get("message");

            notificationService.notifyMentor(mentorId, message);
            return ResponseEntity.ok("Notifica inviata al mentor " + mentorId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella richiesta: " + e.getMessage());
        }
    }

    @GetMapping("/notifications/{mentorId}")
    public ResponseEntity<List<Notification>> getMentorNotifications(@PathVariable Long mentorId) {
        List<Notification> notifications = notificationService.getMentorNotifications(mentorId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/read/{mentorId}")
    public ResponseEntity<String> markNotificationsAsRead(@PathVariable Long mentorId) {
        notificationService.markNotificationsAsRead(mentorId);
        return ResponseEntity.ok("Notifiche segnate come lette per il mentor " + mentorId);
    }


}
