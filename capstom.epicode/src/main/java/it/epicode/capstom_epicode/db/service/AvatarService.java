package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.db.pojo.Avatar;
import it.epicode.capstom_epicode.db.repository.AvatarRepository;
import it.epicode.capstom_epicode.web.dto.UploadAvatarRequest;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AvatarService {
    @Autowired
    private AvatarRepository avatarRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Transactional
    public Avatar save(UploadAvatarRequest newAvatar, String imageUrl) {
        AppUser user = appUserRepository.findById(newAvatar.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente non trovato con ID: " + newAvatar.getUserId()));

        int updatedRows = avatarRepository.updateAvatarPath(user.getId(), imageUrl);
        if (updatedRows > 0) {
            return user.getAvatar();
        }

        Avatar avatar = new Avatar();
        avatar.setUser(user);
        avatar.setPath(imageUrl);
        user.setAvatar(avatar);

        appUserRepository.save(user);
        return avatarRepository.save(avatar);
    }
}








