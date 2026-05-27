import prisma from "../config/prisma.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier requis" });
    }

    const { name, type } = req.body;

    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        name: name || req.file.originalname,
        type: type || "other",
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size
      }
    });

    return res.status(201).json({
      message: "Document ajouté avec succès",
      document
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ message: "Document introuvable" });
    }
    if (doc.userId !== req.user.id) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await prisma.document.delete({ where: { id } });

    return res.json({ message: "Document supprimé" });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
