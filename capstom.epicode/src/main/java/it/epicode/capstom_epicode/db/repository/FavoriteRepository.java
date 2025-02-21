package it.epicode.capstom_epicode.db.repository;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.db.pojo.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @Query("SELECT f FROM Favorite f WHERE f.student.id = :studentId AND f.mentor.id = :mentorId")
    Optional<Favorite> findByStudentAndMentor(@Param("studentId") Long studentId, @Param("mentorId") Long mentorId);

    @Query("SELECT f.mentor FROM Favorite f WHERE f.student.id = :studentId")
    List<AppUser> findFavoritesByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT f.student FROM Favorite f WHERE f.mentor.id = :mentorId")
    List<AppUser> findStudentsByMentorId(@Param("mentorId") Long mentorId);



    void deleteByStudentIdAndMentorId(Long studentId, Long mentorId);
}
