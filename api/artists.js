const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, artists) => {
    if (err) {
      next(err);
    }
    res.status(200).json({artists: artists});
  });
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get('SELECT * FROM Artist WHERE id = $artistId', {$artistId: artistId}, (error, artist) => {
    if (error) {
      next(error);
    } else if (artist) {
      req.artist = artist;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({artist: req.artist});
});

module.exports = artistsRouter;