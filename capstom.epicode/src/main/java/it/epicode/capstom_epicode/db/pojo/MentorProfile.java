package it.epicode.capstom_epicode.db.pojo;

import it.epicode.capstom_epicode.auth.AppUser;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "mentor_profiles")
public class MentorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private AppUser mentor;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 100)
    private String specializzazione;

    @Column(length = 255)
    private String linkedin;

    @Column(length = 255)
    private String website;

    @Column(length = 100)
    private String esperienza;

    @Column(nullable = false, columnDefinition = "FLOAT DEFAULT 0.0")
    private double compensoPerOra;

}
