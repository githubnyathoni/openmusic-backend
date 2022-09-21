/* eslint-disable camelcase */
const mapAlbumDBToModel = ({
  id,
  name,
  year,
  created_at,
  updated_at,
}) => ({
  id, name, year, createdAt: created_at, updatedAt: updated_at,
});

const mapSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel };
