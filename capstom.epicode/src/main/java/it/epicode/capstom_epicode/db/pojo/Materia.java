package it.epicode.capstom_epicode.db.pojo;


import com.fasterxml.jackson.annotation.JsonIgnore;
import it.epicode.capstom_epicode.auth.AppUser;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "materie")
@Data
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String livello;
}

