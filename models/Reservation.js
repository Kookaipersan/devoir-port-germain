// models/Reservation.js
const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  catwayNumber: {
    type: Number,
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
  userId: {  // 🔥 Ajout du lien vers l'utilisateur connecté
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
