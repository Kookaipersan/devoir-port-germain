const express = require('express');
const router = express.Router();
const Catway = require('../models/Catway');
const fs = require('fs');
const path = require('path');
const Reservation = require('../models/Reservation');
/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Récupère la liste des catways
 *     tags: [Catways]
 *     responses:
 *       200:
 *         description: Liste des catways
 *       500:
 *         description: Erreur serveur
 */
// 1. Liste des catways
router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find();
    res.render('catways', { catways });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @swagger
 * /catways/new:
 *   get:
 *     summary: Affiche le formulaire d’ajout de catway
 *     tags: [Catways]
 *     responses:
 *       200:
 *         description: Formulaire affiché
 */

// 3. Ajouter un catway (Formulaire d'ajout)
router.get('/new', (req, res) => {
  res.render('new'); // Rendre le formulaire d'ajout
});

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupère un catway spécifique par ID
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du catway
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du catway
 *       404:
 *         description: Catway non trouvé
 *       500:
 *         description: Erreur serveur
 */

// 2. Détails d'un catway
router.get('/:id', async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ error: 'Catway not found' });
    res.render('catwaysDetails', { catway });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Ajoute un nouveau catway
 *     tags: [Catways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               catwayNumber:
 *                 type: string
 *                 example: A12
 *               catwayType:
 *                 type: string
 *                 example: Type 1
 *               catwayState:
 *                 type: string
 *                 example: Disponible
 *     responses:
 *       302:
 *         description: Redirection vers la liste des catways
 *       400:
 *         description: Erreur de validation
 */

// 4. Ajouter un catway (Traitement du formulaire)
router.post('/', async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  try {
    const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
    await newCatway.save();
    res.redirect('/catways'); // Rediriger vers la liste des catways après l'ajout
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /catways/edit/{id}:
 *   get:
 *     summary: Affiche le formulaire d’édition d’un catway
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du catway à modifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Formulaire d’édition affiché
 *       404:
 *         description: Catway introuvable
 *       500:
 *         description: Erreur serveur
 */


// 5. Modifier un catway
router.get('/edit/:id', async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).send('Catway introuvable');
    res.render('editCatway', { catway }); // ce fichier ejs doit exister dans /views
  } catch (err) {
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Met à jour l’état d’un catway
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du catway à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               catwayState:
 *                 type: string
 *                 example: Indisponible
 *     responses:
 *       200:
 *         description: Catway mis à jour
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Catway non trouvé
 */


// 6. Modifier un catway (seul l'état peut être modifié)
router.put('/:id', async (req, res) => {
  const { catwayState } = req.body;  // On ne modifie que l'état du catway
  try {
    const catway = await Catway.findByIdAndUpdate(
      req.params.id,
      { catwayState },  // Mise à jour de l'état seulement
      { new: true }  // Renvoyer le catway mis à jour
    );
    if (!catway) return res.status(404).json({ error: 'Catway not found' });
    res.json(catway);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprime un catway par ID
 *     tags: [Catways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du catway
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirection après suppression
 *       404:
 *         description: Catway non trouvé
 *       500:
 *         description: Erreur serveur
 */

// 7. Supprimer un catway
router.delete('/:id', async (req, res) => {
  try {
    const catway = await Catway.findByIdAndDelete(req.params.id);
    if (!catway) return res.status(404).json({ error: 'Catway not found' });
    res.redirect('/catways'); // Rediriger vers la liste après suppression
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /catways/import/json:
 *   get:
 *     summary: Importe les catways depuis un fichier JSON
 *     tags: [Catways]
 *     responses:
 *       200:
 *         description: Catways importés avec succès
 *       500:
 *         description: Erreur lors de l’importation
 */

// 8. Importer les catways depuis le fichier catways.json
router.get('/import/json', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'catways.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const catways = JSON.parse(jsonData);

    // Vider la collection avant l'import (optionnel)
    await Catway.deleteMany({});

    // Insérer les catways dans la base de données
    await Catway.insertMany(catways);

    res.status(200).json({ message: 'Importation réussie', importedCount: catways.length });
  } catch (error) {
    console.error('Erreur d’importation :', error);
    res.status(500).json({ error: 'Erreur lors de l’importation des catways' });
  }
});

module.exports = router;
