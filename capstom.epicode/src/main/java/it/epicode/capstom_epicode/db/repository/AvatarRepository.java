package it.epicode.capstom_epicode.db.repository;


import it.epicode.capstom_epicode.db.pojo.Avatar;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface AvatarRepository extends JpaRepository<Avatar, Long> {
    Avatar findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE Avatar a SET a.path = :imageUrl WHERE a.user.id = :userId")
    int updateAvatarPath(Long userId, String imageUrl);
}

