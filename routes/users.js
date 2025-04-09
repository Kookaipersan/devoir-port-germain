const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Secret pour la génération des tokens (à stocker dans un fichier .env)
const JWT_SECRET = 'your_jwt_secret';

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

// Lister tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.render('users', { users });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

// Déconnexion
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
