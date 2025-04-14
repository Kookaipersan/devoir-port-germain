//models/Catways.js

const mongoose = require('mongoose');

const CatwaySchema = new mongoose.Schema({
  catwayNumber: {
    type: Number,
    required: true,
    unique: true
  },
  catwayType: {
    type: String,
    enum: ['short', 'long'],
    required: true
  },
  catwayState: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Catway', CatwaySchema);

