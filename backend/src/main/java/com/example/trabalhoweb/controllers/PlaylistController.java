package com.example.trabalhoweb.controllers;

import com.example.trabalhoweb.models.Music;
import com.example.trabalhoweb.models.MusicDTO;
import com.example.trabalhoweb.models.Playlist;
import com.example.trabalhoweb.models.PlaylistDTO;
import com.example.trabalhoweb.models.User;
import com.example.trabalhoweb.repositories.MusicRepository;
import com.example.trabalhoweb.repositories.PlaylistRepository;
import com.example.trabalhoweb.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("playlist")
public class PlaylistController {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MusicRepository musicRepository;

    @PostMapping
    public ResponseEntity createPlaylist(@RequestBody PlaylistDTO data) {
        try {
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            user = (User) userRepository.findByLogin(user.getLogin());

            if (user == null) {
                return ResponseEntity.status(401).body("Usuário não encontrado");
            }

            Playlist playlist = new Playlist();
            playlist.setName(data.name());
            playlist.setDescription(data.description());
            playlist.setOwner(user);
            playlist.setMusics(new ArrayList<>());

            playlistRepository.save(playlist);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao criar playlist: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Playlist>> getPlaylists() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        user = (User) userRepository.findByLogin(user.getLogin());
        return ResponseEntity.ok(playlistRepository.findByOwner(user));
    }

    @PostMapping("/{id}/add")
    public ResponseEntity addMusicToPlaylist(@PathVariable String id, @RequestBody MusicDTO data) {
        try {
            Optional<Playlist> playlistOpt = playlistRepository.findById(id);
            if (playlistOpt.isEmpty()) {
                return ResponseEntity.status(404).body("Playlist não encontrada");
            }

            Playlist playlist = playlistOpt.get();

            // Check ownership
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!playlist.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("Você não tem permissão para modificar esta playlist");
            }

            Music music = null;
            if (data.spotifyId() != null && !data.spotifyId().isEmpty()) {
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

            if (playlist.getMusics() == null) {
                playlist.setMusics(new ArrayList<>());
            }

            if (!playlist.getMusics().contains(music)) {
                playlist.getMusics().add(music);
                playlistRepository.save(playlist);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao adicionar música à playlist: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Playlist> getPlaylist(@PathVariable String id) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(id);
        if (playlistOpt.isEmpty()) return ResponseEntity.notFound().build();

        Playlist playlist = playlistOpt.get();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if user owns the playlist
        if (!playlist.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(playlist);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity deletePlaylist(@PathVariable String id) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(id);
        if (playlistOpt.isEmpty()) return ResponseEntity.notFound().build();

        Playlist playlist = playlistOpt.get();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if user owns the playlist
        if (!playlist.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        playlistRepository.delete(playlist);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playlistId}/remove/{musicId}")
    public ResponseEntity removeMusicFromPlaylist(@PathVariable String playlistId, @PathVariable String musicId) {
        Optional<Playlist> playlistOpt = playlistRepository.findById(playlistId);
        if (playlistOpt.isEmpty()) return ResponseEntity.notFound().build();

        Playlist playlist = playlistOpt.get();
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // Check if user owns the playlist
        if (!playlist.getOwner().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (playlist.getMusics() != null) {
            playlist.getMusics().removeIf(music -> music.getId().equals(musicId));
            playlistRepository.save(playlist);
        }

        return ResponseEntity.ok().build();
    }
}
