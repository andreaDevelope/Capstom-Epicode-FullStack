package it.epicode.capstom_epicode.db.repository;


import it.epicode.capstom_epicode.db.pojo.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    Optional<Materia> findByNomeAndLivello(String nome, String livello);

    @Query("SELECT m FROM AppUser u JOIN u.materie m WHERE u.id = :studentId")
    List<Materia> findAllByStudentId(@Param("studentId") Long studentId);
}

