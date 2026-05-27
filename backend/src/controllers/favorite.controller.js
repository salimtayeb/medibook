import prisma from "../config/prisma.js";

export const addFavorite = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Seuls les patients peuvent ajouter des favoris" });
    }

    const { doctorId } = req.params;

    const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    const existing = await prisma.favoriteDoctor.findUnique({
      where: { patientId_doctorId: { patientId: req.user.id, doctorId } }
    });

    if (existing) {
      return res.status(409).json({ message: "Déjà dans vos favoris" });
    }

    const fav = await prisma.favoriteDoctor.create({
      data: { patientId: req.user.id, doctorId },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } }
          }
        }
      }
    });

    return res.status(201).json({ message: "Ajouté aux favoris", favorite: fav });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const fav = await prisma.favoriteDoctor.findUnique({
      where: { patientId_doctorId: { patientId: req.user.id, doctorId } }
    });

    if (!fav) {
      return res.status(404).json({ message: "Favori non trouvé" });
    }

    await prisma.favoriteDoctor.delete({ where: { id: fav.id } });

    return res.json({ message: "Retiré des favoris" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getMyFavorites = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Accès réservé aux patients" });
    }

    const favorites = await prisma.favoriteDoctor.findMany({
      where: { patientId: req.user.id },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ favorites });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
