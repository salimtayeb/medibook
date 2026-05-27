import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../validators/auth.validator.js";

export const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    const { email, password, firstName, lastName, role, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Compte créé avec succès",
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: validation.data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return res.json({
      message: "Profil mis à jour avec succès",
      user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const validation = changePasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    const { currentPassword, newPassword } = validation.data;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        message: "Mot de passe actuel incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.json({
      message: "Mot de passe modifié avec succès"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
