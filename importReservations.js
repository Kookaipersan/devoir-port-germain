// importReservations.js
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Reservation = require("./models/Reservation");

// 1. Connexion à MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/RUSSEL/RESERVATIONS"; // Change si besoin
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("✅ Connexion MongoDB réussie");

  try {
    // 2. Lecture du fichier JSON
    const filePath = path.join(__dirname, "data", "reservations.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // 3. Insertion dans la base
    await Reservation.insertMany(data);
    console.log("✅ Données importées avec succès");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Erreur d’importation :", err);
    mongoose.connection.close();
  }
});
