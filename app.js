const express = require('express');
const connectDB = require('./config/db');  // Importation de la fonction de connexion à la DB
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const filePath = path.join(__dirname, '..', 'data', 'catways.json');
const catwaysRouter = require('./routes/catways');
const session = require('express-session');

// Connexion à MongoDB
connectDB();

mongoose.connection.once('open', () => {
    console.log('Connexion à MongoDB réussie');
  }).on('error', (error) => {
    console.log('Erreur de connexion MongoDB:', error);
  });

// Importation des modèles
const Catway = require('./models/Catway');
const Reservation = require('./models/Reservation');

// Configuration d'EJS comme moteur de template
app.set('view engine', 'ejs');
app.set('views', './views'); // répertoire où seront stockés les fichiers .ejs

// Autres configurations...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/catways', catwaysRouter);

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.render('home');
});

// Route pour le tableau de bord
app.get('/dashboard', (req, res) => {
    if (!req.user) {  // Vérifier si l'utilisateur est connecté
        return res.redirect('/');
    }

    // Récupérer les réservations pour l'utilisateur connecté
    Reservation.find({ userId: req.user._id }, (err, reservations) => {
        res.render('dashboard', { user: req.user, reservations });
    });
});

// Routes pour les catways (listage, création, modification, suppression)
app.get('/catways', (req, res) => {
    Catway.find({}, (err, catways) => {
        res.render('catways', { catways });
    });
});

app.post('/catways/new', (req, res) => {
    const newCatway = new Catway({ number: req.body.number });
    newCatway.save().then(() => {
        res.redirect('/catways');
    });
});

// Exemple de modification et suppression de catway, tu peux faire de même pour les réservations et les utilisateurs.

// Importer les routes pour les catways et les réservations
const catwaysRoutes = require('./routes/catways');
const reservationsRoutes = require('./routes/reservations');

// Utiliser les routes
app.use('/catways', catwaysRoutes); // Toutes les routes liées aux catways
app.use('/reservations', reservationsRoutes); // Toutes les routes liées aux réservations

app.use(session({
    secret: 'votre_clé_secrète',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // mettez `secure: true` si vous utilisez HTTPS
}));

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
