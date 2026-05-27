import prisma from "../config/prisma.js";

export const getPharmacies = async (req, res) => {
  try {
    const { city, lat, lng, radius } = req.query;

    let pharmacies;

    if (city) {
      pharmacies = await prisma.pharmacy.findMany({
        where: {
          city: { contains: city, mode: "insensitive" }
        },
        orderBy: { name: "asc" }
      });
    } else if (lat && lng) {
      const all = await prisma.pharmacy.findMany();
      const rad = parseFloat(radius) || 10;
      pharmacies = all.filter((p) => {
        if (p.latitude == null || p.longitude == null) return false;
        const d = distance(parseFloat(lat), parseFloat(lng), p.latitude, p.longitude);
        return d <= rad;
      });
      pharmacies.sort((a, b) => {
        const da = distance(parseFloat(lat), parseFloat(lng), a.latitude, a.longitude);
        const db = distance(parseFloat(lat), parseFloat(lng), b.latitude, b.longitude);
        return da - db;
      });
    } else {
      pharmacies = await prisma.pharmacy.findMany({
        orderBy: { name: "asc" }
      });
    }

    return res.json({ pharmacies });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const createPharmacy = async (req, res) => {
  try {
    const { name, address, phone, city, latitude, longitude, openingHours } = req.body;

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        address,
        phone,
        city,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        openingHours
      }
    });

    return res.status(201).json({
      message: "Pharmacie ajoutée",
      pharmacy
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const deletePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pharmacy.delete({ where: { id } });
    return res.json({ message: "Pharmacie supprimée" });
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
