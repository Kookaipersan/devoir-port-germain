router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');  // Redirige vers la page d'accueil si non connecté
    }

    // Passer les informations utilisateur à la vue
    res.render('dashboard', { user: req.session.user });
});
