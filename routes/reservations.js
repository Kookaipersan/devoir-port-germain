const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// -----------------------------
// LISTE DES RÉSERVATIONS PAR CATWAY
// -----------------------------
router.get('/catways/:catwayId/reservations', async (req, res) => {
  try {
    const { catwayId } = req.params;
    const reservations = await Reservation.find({ catwayNumber: catwayId }).populate('catwayNumber');
    res.render('reservations', { reservations, catwayId });
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des réservations');
  }
});

// -----------------------------
// FORMULAIRE CRÉATION RÉSERVATION
// -----------------------------
router.get('/catways/:id/reservations/new', (req, res) => {
  res.render('reservations/newReservation', { catwayId: req.params.id });
});

router.get('/reservations/new', (req, res) => {
  res.render('reservations/newReservation');
});

// -----------------------------
// AJOUTER UNE NOUVELLE RÉSERVATION
// -----------------------------
router.post('/catways/:id/reservations', async (req, res) => {
  const { id } = req.params;
  const { clientName, boatName, startDate, endDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de catway invalide.');
  }

  try {
    const newReservation = new Reservation({
      catwayNumber: id,
      clientName,
      boatName,
      startDate,
      endDate,
      userId: req.session.user._id
    });

    await newReservation.save();
    res.redirect(`/catways/${id}/reservations`);
  } catch (err) {
    res.status(500).send('Erreur lors de la création de la réservation.');
  }
});

router.post('/reservations', async (req, res) => {
  const { clientName, boatName, startDate, endDate } = req.body;

  try {
    const newReservation = new Reservation({
      clientName,
      boatName,
      startDate,
      endDate,
      userId: req.session.user._id
    });

    await newReservation.save();
    res.redirect('/reservations');
  } catch (err) {
    res.status(500).send('Erreur lors de la création de la réservation.');
  }
});

// -----------------------------
// MODIFIER UNE RÉSERVATION
// -----------------------------
router.get('/catways/:catwayId/reservations/edit/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de réservation invalide.');
  }

  try {
    const reservation = await Reservation.findById(id).populate('catwayNumber');
    if (!reservation) return res.status(404).send('Réservation introuvable');

    res.render('reservations/edit', { reservation });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de réservation invalide.');
  }

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) return res.status(404).send('Réservation introuvable');

    res.render('reservations/edit', { reservation });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

router.put('/:id', async (req, res) => {
  const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;

  // Vérifie si la date de début est antérieure à la date de fin
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({ error: 'La date de début doit être antérieure à la date de fin' });
  }

  // Préparer l'objet à mettre à jour
  const updateData = { clientName, boatName, startDate, endDate };

  // Si catwayNumber est fourni, l'ajouter à l'objet de mise à jour
  if (catwayNumber) {
    updateData.catwayNumber = catwayNumber;
  }

  try {
    // Mise à jour de la réservation avec les nouvelles données
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
    res.redirect(`/reservations/${reservation._id}`); // Rediriger vers la page de détails de la réservation mise à jour
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// -----------------------------
// SUPPRIMER UNE RÉSERVATION
// -----------------------------
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// DÉTAIL D'UNE RÉSERVATION
// -----------------------------
router.get('/catways/:catwayId/reservations/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID de réservation invalide.');
  }

  try {
    const reservation = await Reservation.findById(id).populate('catwayNumber');
    if (!reservation) return res.status(404).send('Réservation introuvable');

    res.render('reservations/show', { reservation });
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send('ID de réservation invalide.');
  }

  try {
    const reservation = await Reservation.findById(req.params.id).populate('catwayNumber');
    if (!reservation) return res.status(404).send('Réservation introuvable');
    res.render('reservations/show', { reservation });

  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

// -----------------------------
// LISTE PAGINÉE
// -----------------------------
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const reservations = await Reservation.find()
      .populate('catwayNumber')
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('reservations', { reservations, catwayId: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// MES RÉSERVATIONS (utilisateur connecté)
// -----------------------------
router.get('/my-reservations', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const reservations = await Reservation.find({ userId: req.session.user._id });
    res.render('dashboard', {
      user: req.session.user,
      reservations,
      today: new Date().toLocaleDateString('fr-FR')
    });
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des réservations');
  }
});

// -----------------------------
// IMPORT JSON
// -----------------------------
router.get('/import/json', async (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'reservations.json');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Le fichier reservations.json est introuvable' });
  }

  try {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const reservations = JSON.parse(jsonData);

    await Reservation.deleteMany(); // vide la collection si besoin
    await Reservation.insertMany(reservations);

    res.status(200).json({ message: 'Importation réussie', importedCount: reservations.length });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l’importation des réservations' });
  }
});

module.exports = router;
