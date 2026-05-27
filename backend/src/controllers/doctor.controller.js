import prisma from "../config/prisma.js";

export const getDoctors = async (req, res) => {
  try {
    const { city, specialty, lat, lng, radius } = req.query;

    const where = {};

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (specialty) {
      where.specialty = { contains: specialty, mode: "insensitive" };
    }

    let doctors = await prisma.doctorProfile.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (lat && lng) {
      const rad = parseFloat(radius) || 10;
      doctors = doctors.filter((d) => {
        if (d.latitude == null || d.longitude == null) return false;
        const dist = distance(parseFloat(lat), parseFloat(lng), d.latitude, d.longitude);
        return dist <= rad;
      });
      doctors.sort((a, b) => {
        const da = a.latitude != null ? distance(parseFloat(lat), parseFloat(lng), a.latitude, a.longitude) : 9999;
        const db = b.latitude != null ? distance(parseFloat(lat), parseFloat(lng), b.latitude, b.longitude) : 9999;
        return da - db;
      });
    }

    const doctorsWithRating = doctors.map((d) => {
      const ratings = d.reviews.map((r) => r.rating);
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
      const { reviews, ...rest } = d;
      return { ...rest, averageRating: Math.round(avg * 10) / 10, reviewCount: ratings.length };
    });

    return res.json({
      message: "Liste des médecins récupérée avec succès",
      doctors: doctorsWithRating
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const getDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Accès réservé aux médecins" });
    }

    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        }
      }
    });

    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Seuls les médecins peuvent modifier leur profil"
      });
    }

    const { specialty, city, description, price, address, latitude, longitude } = req.body;

    const updatedProfile = await prisma.doctorProfile.upsert({
      where: { userId: req.user.id },
      update: {
        ...(specialty !== undefined && { specialty }),
        ...(city !== undefined && { city }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price ? parseInt(price, 10) : null }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null })
      },
      create: {
        userId: req.user.id,
        specialty: specialty || "",
        city: city || "",
        description: description || "",
        price: price ? parseInt(price, 10) : null,
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return res.json({
      message: "Profil mis à jour avec succès",
      profile: updatedProfile
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
