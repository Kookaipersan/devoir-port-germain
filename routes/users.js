const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Secret pour la génération des tokens (à stocker dans un fichier .env)
const JWT_SECRET = 'your_jwt_secret';

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirige vers le tableau de bord après création
 *       400:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */


// Créer un utilisateur
router.post('/create', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur lors de la création du compte :', error);
    res.status(500).render('signup', { errorMessage: 'Erreur lors de la création du compte.' });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags: [users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       400:
 *         description: Erreur serveur
 */

// Lister tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', { users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Obtenir un utilisateur par son email
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */

// Détails d'un utilisateur
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Modifier un utilisateur par son email
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *       404:
 *         description: Utilisateur non trouvé
 */

// Modifier un utilisateur
router.put('/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Supprimer un utilisateur par son email
 *     tags: [users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur non trouvé
 */

// Supprimer un utilisateur
router.delete('/:email', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authentification utilisateur
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirige vers le dashboard
 *       400:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Connexion d'un utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Enregistrer dans la session
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur de connexion :', error);
    res.status(500).render('home', { errorMessage: 'Erreur lors de la connexion.' });
  }
});

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Déconnexion utilisateur
 *     tags: [users]
 *     responses:
 *       302:
 *         description: Redirige vers la page d'accueil après déconnexion
 */

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
