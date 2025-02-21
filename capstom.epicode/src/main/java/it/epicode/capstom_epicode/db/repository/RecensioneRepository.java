package it.epicode.capstom_epicode.db.repository;

import it.epicode.capstom_epicode.db.pojo.Recensione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecensioneRepository extends JpaRepository<Recensione, Long> {

    List<Recensione> findByMentorId(Long mentorId);

    Optional<Recensione> findByMentorIdAndStudenteId(Long mentorId, Long studenteId);

    @Query("SELECT AVG(r.stelle) FROM Recensione r WHERE r.mentor.id = :mentorId")
    Double getMediaStelleByMentorId(@Param("mentorId") Long mentorId);
}

