const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost/movieapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));
const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  year: Number
});
const Movie = mongoose.model('Movie', movieSchema);
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  fs.appendFile('log.txt', log, err => {
    if (err) console.error('Failed to log request:', err);
  });
  next();
});
app.get('/movies', (req, res) => {
  Movie.find()
    .then(movies => res.json(movies))
    .catch(err => res.status(500).json({ error: 'Failed to fetch movies' }));
});
app.post('/movies', (req, res) => {
  const { title, genre, year } = req.body;
  const movie = new Movie({ title, genre, year });
  movie.save()
    .then(savedMovie => res.status(201).json(savedMovie))
    .catch(err => res.status(500).json({ error: 'Failed to add movie' }));
});

app.put('/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title, genre, year } = req.body;
  Movie.findByIdAndUpdate(id, { title, genre, year }, { new: true })
    .then(updatedMovie => res.json(updatedMovie))
    .catch(err => res.status(500).json({ error: 'Failed to update movie' }));
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  Movie.findByIdAndDelete(id)
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).json({ error: 'Failed to delete movie' }));
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
