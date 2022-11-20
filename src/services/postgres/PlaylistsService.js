/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const SongsService = require('./SongsService');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
    this._songsService = new SongsService();
  }

  async verifyPlaylistOwner({ playlistId, ownerId }) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== ownerId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addPlaylist({ name, ownerId }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, ownerId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists({ ownerId }) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
             LEFT JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1
             OR users.id = $1`,
      values: [ownerId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById({ playlistId, ownerId }) {
    await this.verifyPlaylistOwner({ playlistId, ownerId });

    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 AND owner = $2 RETURNING id',
      values: [playlistId, ownerId],
    };

    await this._pool.query(query);
  }

  async addSongToPlaylist({ playlistId, songId, ownerId }) {
    await this.verifyPlaylistOwner({ playlistId, ownerId });
    await this._songsService.getSongById(songId);

    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongsByPlaylistId({ playlistId, ownerId }) {
    await this.verifyPlaylistOwner({ playlistId, ownerId });

    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
             LEFT JOIN users ON playlists.owner = users.id WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const playlist = await this._pool.query(query);

    if (!playlist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
             LEFT JOIN playlist_songs ON songs.id = playlist_songs.song_id
             WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const songs = await this._pool.query(querySongs);
    playlist.rows[0].songs = songs.rows;

    return playlist.rows[0];
  }

  async deleteSongPlaylistById({ playlistId, songId, ownerId }) {
    await this.verifyPlaylistOwner({ playlistId, ownerId });

    const query = {
      text: `DELETE FROM playlist_songs WHERE playlist_id = $1
             AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
