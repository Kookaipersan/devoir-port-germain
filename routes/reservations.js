const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
/**
 * @swagger
 * /catways/{catwayId}/reservations:
 *   get:
 *     summary: Récupère toutes les réservations d'un catway
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: catwayId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du catway
 *     responses:
 *       200:
 *         description: Liste des réservations affichée dans la vue
 *       500:
 *         description: Erreur serveur
 */
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

/**
 * @swagger
 * /catways/{catwayId}/reservations:
 *   post:
 *     summary: Créer une réservation pour un catway
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: catwayId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       302:
 *         description: Redirection vers les réservations du catway
 *       500:
 *         description: Erreur lors de la création
 */

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
/**
 * @swagger
 * /reservations/catways/{id}/reservations:
 *   post:
 *     summary: Ajouter une nouvelle réservation à un catway
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du catway
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - boatName
 *               - startDate
 *               - endDate
 *             properties:
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       302:
 *         description: Redirection après succès
 *       500:
 *         description: Erreur lors de la création
 */
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

/**
 * @swagger
 * /reservations/catways/{catwayId}/reservations/edit/{id}:
 *   get:
 *     summary: Formulaire pour modifier une réservation liée à un catway
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: catwayId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du catway
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Formulaire d’édition affiché
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /reservations/{id}:
 *   put:
 *     summary: Mettre à jour une réservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la réservation à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catwayNumber:
 *                 type: string
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Réservation non trouvée
 */

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

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Supprimer une réservation par ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la réservation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation supprimée avec succès
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */
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

/**
 * @swagger
 * /reservations/catways/{catwayId}/reservations/{id}:
 *   get:
 *     summary: Obtenir les détails d’une réservation spécifique liée à un catway
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: catwayId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du catway
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Réservation introuvable
 *       500:
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Obtenir les détails d'une réservation par son ID
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Réservation non trouvée
 *       500:
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Récupère la liste paginée de toutes les réservations
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page à afficher
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre de résultats par page
 *     responses:
 *       200:
 *         description: Liste des réservations
 *       500:
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /my-reservations:
 *   get:
 *     summary: Liste les réservations de l'utilisateur connecté
 *     tags: [Reservations]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Réservations de l'utilisateur affichées dans le dashboard
 *       302:
 *         description: Redirection vers /login si non connecté
 *       500:
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /reservations/import/json:
 *   get:
 *     summary: Importe des réservations depuis un fichier JSON local
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Importation réussie
 *       404:
 *         description: Fichier non trouvé
 *       500:
 *         description: Erreur serveur
 */

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
