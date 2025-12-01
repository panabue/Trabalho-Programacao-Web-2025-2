package com.example.trabalhoweb.repositories;

import com.example.trabalhoweb.models.Playlist;
import com.example.trabalhoweb.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlaylistRepository extends JpaRepository<Playlist, String> {
    List<Playlist> findByOwner(User owner);
}
