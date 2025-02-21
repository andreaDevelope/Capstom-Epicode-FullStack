package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.MateriaRequest;
import it.epicode.capstom_epicode.db.pojo.Materia;
import it.epicode.capstom_epicode.db.repository.MateriaRepository;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository materiaRepository;


    public List<Materia> findAll() {
        return materiaRepository.findAll();
    }


    public Materia findById(Long id) {
        return materiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materia con ID " + id + " non trovata"));
    }



    @Transactional
    public Materia updateMateria(Long id, MateriaRequest materiaRequest) {
        Materia materia = materiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Materia con ID " + id + " non trovata"));

        BeanUtils.copyProperties(materiaRequest, materia, "id"); // Copia i dati ma non sovrascrive l'ID
        return materiaRepository.save(materia);
    }


    @Transactional
    public void deleteMateria(Long id) {
        if (!materiaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Materia con ID " + id + " non trovata");
        }
        materiaRepository.deleteById(id);
    }


    public Materia findByNomeAndLivello(String nome, String livello) {
        return materiaRepository.findByNomeAndLivello(nome, livello)
                .orElseThrow(() -> new ResourceNotFoundException("Materia con nome " + nome + " e livello " + livello + " non trovata"));
    }
}

