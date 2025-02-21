package it.epicode.capstom_epicode.db.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import it.epicode.capstom_epicode.auth.AppUser;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "avatars")
@Data
@NoArgsConstructor
public class Avatar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String path;

    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    public Avatar(String path, AppUser user) {
        this.path = path;
        this.user = user;
    }
}
