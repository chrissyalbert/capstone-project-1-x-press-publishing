const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issuesRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (error, series) => {
    if (error) {
      next(error);
    }
    res.status(200).json({series: series});
  })
});

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE id = $seriesId', {$seriesId: seriesId}, (error, series) => {
    if (error) {
      next(error);
    } else if (series) {
      req.series = series;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  
  if(!name || !description) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
  const values = {
    $name: name,
    $description: description
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    }
    db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
      if (error) {
        next(error);
      }
      res.status(201).json({series: series});
    });
  });
});

seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;

  if (!name || !description) {
    res.sendStatus(400);
  }

  const sql = 'UPDATE Series SET name = $name, description = $description WHERE id = $seriesId';
  const values = {
    $name: name,
    $description: description,
    $seriesId: req.params.seriesId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    }
    db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (error, series) => {
      if (error) {
        next(error);
      }
      res.status(200).json({series: series});
    });
  });
});

module.exports = seriesRouter;