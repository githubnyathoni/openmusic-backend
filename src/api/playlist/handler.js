/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsByPlaylistIdHandler = this.getSongsByPlaylistIdHandler.bind(this);
    this.deleteSongPlaylistByIdHandler = this.deleteSongPlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { id: ownerId } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._service.addPlaylist({ name, ownerId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: ownerId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists({ ownerId });

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    return response;
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    await this._service.deletePlaylistById({ playlistId, ownerId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    await this._service.addSongToPlaylist({ playlistId, songId, ownerId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);
    return response;
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;

    const playlist = await this._service.getSongsByPlaylistId({ playlistId, ownerId });

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongPlaylistByIdHandler(request) {
    this._validator.validateDeleteSongPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: ownerId } = request.auth.credentials;

    await this._service.deleteSongPlaylistById({ playlistId, songId, ownerId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
