import prisma from "../config/prisma.js";

export const createReview = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Seuls les patients peuvent laisser un avis" });
    }

    const { doctorId, rating, comment } = req.body;

    if (!doctorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Note (1-5) et ID médecin requis" });
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({ message: "Médecin non trouvé" });
    }

    const existing = await prisma.review.findUnique({
      where: { doctorId_patientId: { doctorId, patientId: req.user.id } }
    });

    if (existing) {
      return res.status(409).json({ message: "Vous avez déjà noté ce médecin" });
    }

    const review = await prisma.review.create({
      data: {
        doctorId,
        patientId: req.user.id,
        rating,
        comment
      }
    });

    return res.status(201).json({ message: "Avis ajouté avec succès", review });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const avg = await prisma.review.aggregate({
      where: { doctorId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return res.json({
      reviews,
      average: avg._avg.rating || 0,
      count: avg._count.rating
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    if (review.patientId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await prisma.review.delete({ where: { id } });

    return res.json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
