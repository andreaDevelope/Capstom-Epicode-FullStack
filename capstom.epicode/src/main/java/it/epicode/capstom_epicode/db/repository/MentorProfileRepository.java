package it.epicode.capstom_epicode.db.repository;

import it.epicode.capstom_epicode.db.pojo.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByMentorId(Long mentorId);
    @Query("SELECT m FROM MentorProfile m JOIN FETCH m.mentor u WHERE u.id = :mentorId")
    Optional<MentorProfile> findMentorProfileByMentorId(@Param("mentorId") Long mentorId);
    @Query("SELECT m FROM MentorProfile m JOIN FETCH m.mentor u WHERE u.username = :username")
    Optional<MentorProfile> findMentorProfileByUsername(@Param("username") String username);
}

