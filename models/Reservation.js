// models/Reservation.js

const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  // catwayNumber doit être une référence vers le modèle Catway, pas un simple nombre
  catwayNumber: {
    type: mongoose.Schema.Types.ObjectId, // Remplacer Number par ObjectId
    ref: 'Catway',  // Référence au modèle Catway
    required: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  boatName: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  userId: {  // Lien vers l'utilisateur connecté
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Reservation', ReservationSchema);


