const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion de l'utilisateur
 *     description: Permet à un utilisateur de se connecter en fournissant son email et son mot de passe.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Connexion réussie, l'utilisateur est redirigé vers le tableau de bord
 *       401:
 *         description: Utilisateur non trouvé ou mot de passe incorrect
 *       500:
 *         description: Erreur serveur interne
 */

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

        // Redirection vers le tableau de bord
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
