const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const fs = require('fs');
const path = require('path');

// 1. Liste des réservations
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const reservations = await Reservation.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Détails d'une réservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('catwayNumber');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Ajouter une réservation
router.post('/', async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ error: 'La date de début doit être antérieure à la date de fin' });
  }

  try {
    const newReservation = new Reservation({ catwayNumber, clientName, boatName, startDate, endDate });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Modifier une réservation
router.put('/:id', async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
  
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ error: 'La date de début doit être antérieure à la date de fin' });
  }

  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { catwayNumber, clientName, boatName, startDate, endDate }, { new: true });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Importer les réservations depuis reservations.json
router.get('/import/json', async (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'reservations.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Le fichier reservations.json est introuvable' });
  }

  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const reservations = JSON.parse(jsonData);

    // Vider la collection avant l'import (optionnel)
    await Reservation.deleteMany({});

    // Insérer dans la base
    await Reservation.insertMany(reservations);

    res.status(200).json({ message: 'Importation réussie', importedCount: reservations.length });
  } catch (error) {
    console.error('Erreur d’importation :', error);
    res.status(500).json({ error: 'Erreur lors de l’importation des réservations' });
  }
});

module.exports = router;
