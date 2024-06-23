import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2';
import { dbConfig } from './config.js';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())

//el connectiono
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Connection failed: ', err);
        return;
    }
    console.log('Connected to crumbdrop db');
});

// serve dist folder
app.use(express.static("dist"));

// db query !!
app.get('/api/posts', (req, res) => {
    const query = 'SELECT * FROM posts'; 
    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        res.json(results);
    });
});

app.get('/api/lboard', (req, res) => {
    const query = 'SELECT * FROM leaderboard ORDER BY points DESC'; 
    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        res.json(results);
    });
});

app.post('/api/posts', (req, res) => {
    const query = 'INSERT INTO posts (title, school, description, location, imgurl) VALUES (?)';
    const values = [req.body.title, req.body.school, req.body.description, req.body.location, req.body.imageurl];
    connection.query(query, [values], (error, results) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
    });


    // get current points
    const getPoints = 'SELECT points FROM leaderboard WHERE name = ?';
    const name = [req.body.school]

    connection.query(getPoints, [name], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (result.length > 0) {
        let currentPoints = result[0].points;
        let newPoints = currentPoints + 10;
        console.log(currentPoints);
        console.log(newPoints);
        // update points in leaderboard
        const pointquery = 'UPDATE leaderboard SET points = ? WHERE name = ?';
        const pvalues = [newPoints, req.body.school];
        connection.query(pointquery, pvalues, (error, results) => {
            if (error) {
                res.status(500).send(error);
                return;
            }
            res.json({ points: newPoints });
        });
        
    } else {
      res.status(404).json({ error: 'Database error' });
    }
    });
});

app.put('/api/posts', (req, res) => {
    const query = 'UPDATE posts SET claimed = ? WHERE id = ?';
    const values = [req.body.claimed, req.body.id];
    connection.query(query, values, (error, results) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
    });
    // get current points
    const getPoints = 'SELECT points FROM leaderboard WHERE name = ?';
    const name = [req.body.school]

    connection.query(getPoints, [name], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    if (result.length > 0) {
        let currentPoints = result[0].points;
        let newPoints = currentPoints + 100;
        // update points in leaderboard
        const pointquery = 'UPDATE leaderboard SET points = ? WHERE name = ?';
        const pvalues = [newPoints, req.body.school];
        connection.query(pointquery, pvalues, (error, results) => {
            if (error) {
                res.status(500).send(error);
                return;
            }
            res.json({ points: newPoints });
        });
        
    } else {
      res.status(404).json({ error: 'Database error' });
    }
    });
});    


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
