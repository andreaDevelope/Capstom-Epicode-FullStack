package it.epicode.capstom_epicode.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    List<AppUser> findByRuolo(UserRole ruolo);

    @Query("SELECT u FROM AppUser u WHERE u.username = :username")
    Optional<AppUser> findUpdatedUserByUsername(@Param("username") String username);

    @Query("SELECT DISTINCT m FROM AppUser m " +
            "JOIN m.materie materieMentor " +
            "WHERE m.ruolo = 'ROLE_MENTOR' " +
            "AND EXISTS (SELECT 1 FROM AppUser s " +
            "            JOIN s.materie materieStudente " +
            "            WHERE s.id = :studentId " +
            "            AND materieMentor.id = materieStudente.id)")
    List<AppUser> findMentorsWithCommonSubjects(@Param("studentId") Long studentId);

}
