package it.epicode.capstom_epicode.db.repository;

import it.epicode.capstom_epicode.db.pojo.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByMentorIdOrderByTimestampDesc(Long mentorId);
}
