package it.epicode.capstom_epicode.db.pojo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mentorId;
    private String content;
    private boolean isRead;
    private LocalDateTime timestamp;
    private String whatsapp;

    public Notification() {
    }

    public Notification(Long mentorId, String content, String whatsapp) {
        this.mentorId = mentorId;
        this.content = content;
        this.isRead = false;
        this.timestamp = LocalDateTime.now();
        this.whatsapp = whatsapp;
    }

    public Long getId() { return id; }
    public Long getMentorId() { return mentorId; }
    public String getContent() { return content; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getWhatsapp() { return whatsapp; }

    public void setId(Long id) { this.id = id; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }
    public void setContent(String content) { this.content = content; }
    public void setRead(boolean read) { isRead = read; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setWhatsapp(String whatsapp) { this.whatsapp = whatsapp; }
}
