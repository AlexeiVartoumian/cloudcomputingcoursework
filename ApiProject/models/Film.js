const mongoose = require('mongoose');

const FilmSchema = new mongoose.Schema(
    {
    title: {
      type: String,
      required: true
    },
    year: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    },
    director: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    }
  },{
    collection: 'ColFilms',
    timestamps: true
  }
)


module.exports = mongoose.model('Film', FilmSchema, 'ColFilms')