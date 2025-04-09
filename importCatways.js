// Import des modules nécessaires
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Catway = require('./models/Catway'); // Assure-toi que le modèle Catway est bien défini dans models/Catway.js

// Connexion à la base de données
mongoose.connect('mongodb://localhost:27017/RUSSELL/CATWAYS', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connexion à MongoDB réussie');
}).catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
});

// Lecture du fichier catways.json
const filePath = path.join(__dirname, 'data', 'catways.json');
const catwaysData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Fonction d'importation des catways
async function importCatways() {
  try {
    // Effacer les données existantes dans la collection Catway avant d'ajouter les nouvelles
    await Catway.deleteMany({});
    console.log('Anciennes données supprimées.');

    // Insérer les nouvelles données dans la collection Catway
    await Catway.insertMany(catwaysData);
    console.log('Données catways importées avec succès');
  } catch (err) {
    console.error('Erreur lors de l\'importation des catways:', err);
  } finally {
    // Fermer la connexion à MongoDB
    mongoose.connection.close();
  }
}

// Lancer l'importation
importCatways();
