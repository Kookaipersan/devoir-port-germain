const express = require('express');
const connectDB = require('./config/db');  // Importation de la fonction de connexion à la DB
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const session = require('express-session');

// Importation des modèles
const Catway = require('./models/Catway');
const Reservation = require('./models/Reservation');

// Importation des routes
const catwaysRouter = require('./routes/catways');
const authRouter = require('./routes/auth');  // Importer le fichier auth.js
const userRoutes = require('./routes/users');
const reservationsRouter = require('./routes/reservations');  // Importer les routes des réservations

// Connexion à MongoDB
connectDB();

mongoose.connection.once('open', () => {
    console.log('Connexion à MongoDB réussie');
}).on('error', (error) => {
    console.log('Erreur de connexion MongoDB:', error);
});

// Configuration de la session
app.use(session({
    secret: 'votre_clé_secrète',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // mettez `secure: true` si vous utilisez HTTPS
}));
app.get('/signup', (req, res) => {
    res.render('signup');  // Assurez-vous que le fichier signup.ejs existe dans le répertoire views
});

// Configuration d'EJS comme moteur de template
app.set('view engine', 'ejs');
app.set('views', './views'); // répertoire où seront stockés les fichiers .ejs

// Middleware pour analyser les corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utilisation des routes
app.use('/catways', catwaysRouter);
app.use('/login', authRouter);  // Définir la route /login
app.use('/users', userRoutes);  // Enregistre les routes pour /users
app.use('/reservations', reservationsRouter);  // Enregistre les routes pour /reservations

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.render('home', {
        user: req.session.user || null,
        errorMessage: null,  
    });
});


// Route pour le tableau de bord
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {  // Vérifier si l'utilisateur est connecté
        return res.redirect('/');
    }
    

    // Récupérer les réservations de l'utilisateur connecté
    try {
        const reservations = await Reservation.find();
        const currentDate = new Date();  // Date du jour
        res.render('dashboard', {
            user: req.session.user,  // Informations sur l'utilisateur connecté
            currentDate: currentDate, // Date du jour
            reservations: reservations  // Réservations en cours de l'utilisateur
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des réservations:', err);
        res.status(500).render('dashboard', {
            errorMessage: 'Erreur serveur. Impossible de récupérer les réservations.'
        });
    }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
