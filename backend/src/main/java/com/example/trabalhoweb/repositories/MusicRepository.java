package com.example.trabalhoweb.repositories;

import com.example.trabalhoweb.models.Music;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MusicRepository extends JpaRepository<Music, String> {
    List<Music> findBySpotifyId(String spotifyId);
}
