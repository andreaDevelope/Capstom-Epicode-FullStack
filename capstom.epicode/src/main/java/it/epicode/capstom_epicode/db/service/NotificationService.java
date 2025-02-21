package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.db.pojo.Favorite;
import it.epicode.capstom_epicode.db.pojo.Notification;
import it.epicode.capstom_epicode.db.repository.FavoriteRepository;
import it.epicode.capstom_epicode.db.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    SimpMessagingTemplate messagingTemplate;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    FavoriteRepository favoriteRepository;

    public void notifyMentor(Long mentorId, String message) {
        // Trova tutti gli studenti che hanno il mentor nei preferiti
        List<AppUser> studenti = favoriteRepository.findStudentsByMentorId(mentorId);

        if (!studenti.isEmpty()) {
            for (AppUser student : studenti) {
                String username = student.getUsername();
                String whatsapp = student.getWhatsapp();

                String formattedMessage = username + " ti ha aggiunto tra i suoi preferiti! Vuoi contattarlo?";

                // Creiamo e salviamo la notifica nel database
                Notification notification = new Notification(mentorId, formattedMessage, whatsapp);
                notification.setRead(false);  // Assicuriamoci che sia segnata come "non letta"
                notificationRepository.save(notification);

                System.out.println("✅ Notifica salvata per il mentor " + mentorId + ": " + formattedMessage);

                // Creiamo il messaggio da inviare via WebSocket
                String jsonMessage = String.format(
                        "{\"id\": %d, \"type\": \"notification\", \"content\": \"%s\", \"isRead\": %b, \"whatsapp\": \"%s\"}",
                        notification.getId(), formattedMessage, notification.isRead(), whatsapp
                );

                // Invia la notifica via WebSocket al mentor
                String topic = "/topic/mentor/" + mentorId;
                messagingTemplate.convertAndSend(topic, jsonMessage);

                System.out.println("📡 Notifica WebSocket inviata a: " + topic);
            }
        } else {
            System.err.println("❌ Nessuno studente trovato per il mentor con ID: " + mentorId);
        }
    }




    @Transactional
    public void markNotificationsAsRead(Long mentorId) {
        List<Notification> notifications = notificationRepository.findByMentorIdOrderByTimestampDesc(mentorId);
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        }
    }

    public List<Notification> getMentorNotifications(Long mentorId) {
        List<Notification> notifications = notificationRepository.findByMentorIdOrderByTimestampDesc(mentorId);

        List<AppUser> studenti = favoriteRepository.findStudentsByMentorId(mentorId);

        if (!studenti.isEmpty()) {
            for (Notification notification : notifications) {
                for (AppUser student : studenti) {
                    String username = student.getUsername();
                    String whatsapp = student.getWhatsapp();

                    notification.setContent(username + " ti ha aggiunto tra i suoi preferiti! Vuoi contattarlo?");
                    notification.setWhatsapp(whatsapp);
                }
            }
        } else {
            System.err.println("❌ Nessuno studente trovato per il mentor con ID: " + mentorId);
        }

        return notifications;
    }

}


