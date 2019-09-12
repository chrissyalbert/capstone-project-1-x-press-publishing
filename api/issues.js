const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
  const sql = 'SELECT * FROM Issue WHERE id = $issueId';
  const values = {$issueId: issueId};
  db.get(sql,values, (error, issue) => {
    if (error) {
      next(error);
    }
    if (issue) {
      next();
    }
    res.sendStatus(404);
  });
});

issuesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Issue', (error, issues) => {
    if (error) {
      next(error);
    }
    res.status(200).json({issues: issues});
  })
});

issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const artistSql = 'SELECT * FROM Artist WHERE id = $artistId';
  const artistValues = {$artistId: artistId};

  db.get(artistSql, artistValues, (error, artist) => {
    if (error) {
      next(error);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      } 
      const sql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
      const values = {
        $name: name, 
        $issueNumber: issueNumber, 
        $publicationDate: publicationDate, 
        $artistId: artistId, 
        $seriesId: req.params.seriesId
      };
      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        }
        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (error, issue) => {
          if(error) {
            next(error);
          }
          res.status(201).json({issue: issue});
        });
      });
    }
  });
});

issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const artistSql = 'SELECT * FROM Artist WHERE id = $artistId';
  const artistValues = {$artistId: artistId};

  db.get(artistSql, artistValues, (error, artist) => {
    if (error) {
      next(error);
    } else {
      if (!name || !issueNumber || !publicationDate || !artist) {
        return res.sendStatus(400);
      } 
      const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate,  series_id = $seriesId WHERE artist_id = $artistId';
      const values = {
        $name: name, 
        $issueNumber: issueNumber, 
        $publicationDate: publicationDate,  
        $seriesId: req.params.seriesId,
        $artistId: artistId
      };
      db.run(sql, values, (error, series) => {
        if (error) {
          next(error);
        }
        res.status(200).json({series: series});
      });
    }
  });
});

module.exports = issuesRouter;