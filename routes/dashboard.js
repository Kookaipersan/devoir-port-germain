app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
        return res.redirect('/');
    }

    // Récupérer les réservations ou d'autres données associées à l'utilisateur
    Reservation.find({ userId: req.session.user._id }, (err, reservations) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }
        res.render('dashboard', { user: req.session.user, reservations });
    });
});
