const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

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

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (error, series) => {
    if (error) {
      next(error);
    }
    res.status(200).json({series: series});
  })
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
    return res.sendStatus(400);
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

seriesRouter.delete('/:seriesId', (req, res, next) => {
  const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
  const issueValues = {$seriesId: req.params.seriesId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
      const deleteValues = {$seriesId: req.params.seriesId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});
/*
seriesRouter.delete('/:seriesId', (req, res, next) => {
  const issueSql = 'SELECT * FROM Issue WHERE series_id = $seriesId';
  const issueValues = {$seriesId: req.params.seriesId};
  db.get(issueSql, issueValues, (error, issue) => {
    if (error) {
      next(error);
    }
    if (issue) {
      res.sendStatus(400);
    }
    db.run('DELETE FROM Series WHERE id = $seriesId', {$seriesId: req.params.seriesId}, error => {
      if (error) {
        next(error);
      }
      res.sendStatus(204);
    });
  });
});
*/
module.exports = seriesRouter;