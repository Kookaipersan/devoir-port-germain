const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Route de connexion
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).render('home', { 
                errorMessage: 'Utilisateur non trouvé', 
                user: null 
            });
        }

        // Comparer le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Mot de passe entré :', password);
        console.log('Mot de passe haché stocké :', user.password);
        console.log('Résultat comparaison :', isMatch);

        // Authentifier l'utilisateur et initialiser la session
        req.session.user = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        // ✅ Redirection vers le tableau de bord
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).render('home', { 
            errorMessage: 'Erreur serveur. Veuillez réessayer.', 
            user: null 
        });
    }
});

module.exports = router;
