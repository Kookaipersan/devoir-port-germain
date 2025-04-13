/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Affiche le tableau de bord de l'utilisateur connecté
 *     tags: [Dashboard]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Page du tableau de bord affichée avec les réservations de l'utilisateur
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       302:
 *         description: Redirection si l'utilisateur n'est pas connecté
 *       500:
 *         description: Erreur serveur
 */



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
