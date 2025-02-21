package it.epicode.capstom_epicode.db.pojo;

import it.epicode.capstom_epicode.auth.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recensioni")
public class Recensione {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private AppUser mentor;

    @ManyToOne
    @JoinColumn(name = "studente_id", nullable = false)
    private AppUser studente;

    @Column(nullable = false)
    private double stelle;

    @Column(length = 500)
    private String commento;

    @Column(nullable = false)
    private LocalDateTime dataRecensione;
}
