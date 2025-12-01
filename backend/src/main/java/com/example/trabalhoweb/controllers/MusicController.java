package com.example.trabalhoweb.controllers;

import com.example.trabalhoweb.models.Music;
import com.example.trabalhoweb.models.MusicDTO;
import com.example.trabalhoweb.models.User;
import com.example.trabalhoweb.repositories.MusicRepository;
import com.example.trabalhoweb.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("music")
public class MusicController {

    @Autowired
    private MusicRepository musicRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/like")
    public ResponseEntity likeMusic(@RequestBody MusicDTO data) {
        try {
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            user = (User) userRepository.findByLogin(user.getLogin());

            Music music = null;
            if (data.spotifyId() != null) {
                List<Music> musics = musicRepository.findBySpotifyId(data.spotifyId());
                if (!musics.isEmpty()) {
                    music = musics.get(0);
                }
            }

            if (music == null) {
                music = new Music();
                music.setTitle(data.title());
                music.setArtist(data.artist());
                music.setAlbum(data.album());
                music.setSpotifyId(data.spotifyId());
                music.setCoverUrl(data.coverUrl());
                music.setPreviewUrl(data.previewUrl());
                music = musicRepository.save(music);
            }

            if (user.getLikedMusics() == null) {
                user.setLikedMusics(new ArrayList<>());
            }

            if (user.getLikedMusics().contains(music)) {
                user.getLikedMusics().remove(music);
            } else {
                user.getLikedMusics().add(music);
            }

            userRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao curtir música: " + e.getMessage());
        }
    }

    @GetMapping("/liked")
    public ResponseEntity<List<Music>> getLikedMusics() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        user = (User) userRepository.findByLogin(user.getLogin());
        return ResponseEntity.ok(user.getLikedMusics());
    }

    @PostMapping("/play")
    public ResponseEntity playMusic(@RequestBody MusicDTO data) {
        try {
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            user = (User) userRepository.findByLogin(user.getLogin());

            Music music = null;
            if (data.spotifyId() != null) {
                List<Music> musics = musicRepository.findBySpotifyId(data.spotifyId());
                if (!musics.isEmpty()) {
                    music = musics.get(0);
                }
            }

            if (music == null) {
                music = new Music();
                music.setTitle(data.title());
                music.setArtist(data.artist());
                music.setAlbum(data.album());
                music.setSpotifyId(data.spotifyId());
                music.setCoverUrl(data.coverUrl());
                music.setPreviewUrl(data.previewUrl());
                music = musicRepository.save(music);
            }

            user.setLastPlayedMusic(music);
            userRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao registrar reprodução: " + e.getMessage());
        }
    }
}
