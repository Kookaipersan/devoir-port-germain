const express = require('express');
const router = express.Router();
const Catway = require('../models/Catway');
const fs = require('fs');
const path = require('path');

// 1. Liste des catways
router.get('/', async (req, res) => {
  try {
    const catways = await Catway.find();
    res.render('catways', {catways});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Détails d'un catway
router.get('/:id', async (req, res) => {
  try {
    const catway = await Catway.findById(req.params.id);
    if (!catway) return res.status(404).json({ error: 'Catway not found' });
    res.json(catway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Ajouter un catway
router.post('/', async (req, res) => {
  const { catwayNumber, catwayType, catwayState } = req.body;
  try {
    const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
    await newCatway.save();
    res.status(201).json(newCatway);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Modifier un catway (seul l'état peut être modifié)
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

// 5. Supprimer un catway
router.delete('/:id', async (req, res) => {
  try {
    const catway = await Catway.findByIdAndDelete(req.params.id);
    if (!catway) return res.status(404).json({ error: 'Catway not found' });
    res.json({ message: 'Catway deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Importer les catways depuis le fichier catways.json
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
