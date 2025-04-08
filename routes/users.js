const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Secret pour la génération des tokens (à stocker dans un fichier .env pour plus de sécurité)
const JWT_SECRET = 'your_jwt_secret';

// Créer un utilisateur
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  // Vérification de l'existence de l'utilisateur
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Lister tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
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

// Connexion d'un utilisateur (login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérification si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  // Comparer le mot de passe
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: 'Mot de passe incorrect' });
  }

  // Générer un token JWT
  const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Connexion réussie', token });
});

// Déconnexion d'un utilisateur (logout)
router.get('/logout', (req, res) => {
  // Ici, la déconnexion se fait côté client en supprimant le token JWT
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;

