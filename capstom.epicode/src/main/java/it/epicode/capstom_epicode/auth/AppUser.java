package it.epicode.capstom_epicode.auth;

import it.epicode.capstom_epicode.db.pojo.Avatar;
import it.epicode.capstom_epicode.db.pojo.Materia;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
public class AppUser {

    public AppUser(){
        this.abbonamentoAttivo = false;
        this.dataScadenzaAbbonamento = null;
        this.avatar = new Avatar("https://preview.redd.it/l0ergarfzst61.png?auto=webp&s=5de076eac09bb645d58b11cd8ce82f99ec487329", this);
        this.primoLogin = true;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean abbonamentoAttivo;

    private LocalDate dataScadenzaAbbonamento;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cognome;

    @Column(nullable = false)
    private Boolean emailVerificata = false;

    @Column(nullable = false)
    private String whatsapp;

    @Column
    private String fasciaOrariaInizio;

    @Column
    private String fasciaOrariaFine;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private Avatar avatar;

    @ManyToMany
    @JoinTable(
            name = "user_materie",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "materia_id")
    )
    private List<Materia> materie;

    @Column(nullable = false)
    private Boolean primoLogin = true;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole ruolo;
}
