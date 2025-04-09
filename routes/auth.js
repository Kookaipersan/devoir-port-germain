const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();  // Cela doit être un router

// Route de connexion
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).render('home', { errorMessage: 'Utilisateur non trouvé' });
        }

        // Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).render('home', { errorMessage: 'Mot de passe incorrect' });
        }

        // Authentifier l'utilisateur et initialiser la session
        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).render('home', { errorMessage: 'Erreur serveur. Veuillez réessayer.' });
    }
});

module.exports = router;  // Le router est exporté correctement ici
