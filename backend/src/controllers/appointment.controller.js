import prisma from "../config/prisma.js";
import { createAppointmentSchema } from "../validators/appointment.validator.js";

export const createAppointment = async (req, res) => {
  try {
    const validation = createAppointmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Données invalides",
        errors: validation.error.errors
      });
    }

    const { doctorId, startAt, endAt, reason } = validation.data;

    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Seuls les patients peuvent réserver un rendez-vous"
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (endDate <= startDate) {
      return res.status(400).json({
        message: "La date de fin doit être après la date de début"
      });
    }

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Médecin introuvable"
      });
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        status: {
          in: ["PENDING", "CONFIRMED"]
        },
        startAt: {
          lt: endDate
        },
        endAt: {
          gt: startDate
        }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "Ce créneau est déjà réservé"
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        startAt: startDate,
        endAt: endDate,
        reason
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      message: "Rendez-vous réservé avec succès",
      appointment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    let appointments = [];

    if (req.user.role === "PATIENT") {
      appointments = await prisma.appointment.findMany({
        where: {
          patientId: req.user.id
        },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          startAt: "asc"
        }
      });
    }

    if (req.user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: {
          userId: req.user.id
        }
      });

      if (!doctorProfile) {
        return res.status(404).json({
          message: "Profil médecin introuvable"
        });
      }

      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: doctorProfile.id
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          startAt: "asc"
        }
      });
    }

    if (req.user.role === "ADMIN") {
      appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          startAt: "asc"
        }
      });
    }

    return res.json({
      message: "Rendez-vous récupérés avec succès",
      appointments
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "DOCTOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Seuls les médecins et administrateurs peuvent confirmer un rendez-vous"
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    if (appointment.status !== "PENDING") {
      return res.status(400).json({
        message: "Seuls les rendez-vous en attente peuvent être confirmés"
      });
    }

    if (req.user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (doctorProfile?.id !== appointment.doctorId) {
        return res.status(403).json({
          message: "Vous ne pouvez pas confirmer un rendez-vous qui ne vous est pas destiné"
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" }
    });

    return res.json({
      message: "Rendez-vous confirmé avec succès",
      appointment: updatedAppointment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "DOCTOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Seuls les médecins et administrateurs peuvent compléter un rendez-vous"
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    if (appointment.status !== "CONFIRMED") {
      return res.status(400).json({
        message: "Seuls les rendez-vous confirmés peuvent être complétés"
      });
    }

    if (req.user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (doctorProfile?.id !== appointment.doctorId) {
        return res.status(403).json({
          message: "Vous ne pouvez pas compléter un rendez-vous qui ne vous est pas destiné"
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "COMPLETED" }
    });

    return res.json({
      message: "Rendez-vous complété avec succès",
      appointment: updatedAppointment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Rendez-vous introuvable"
      });
    }

    const isPatientOwner =
      req.user.role === "PATIENT" && appointment.patientId === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    let isDoctorOwner = false;

    if (req.user.role === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: req.user.id }
      });

      isDoctorOwner = doctorProfile?.id === appointment.doctorId;
    }

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return res.status(403).json({
        message: "Vous n'avez pas le droit d'annuler ce rendez-vous"
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Ce rendez-vous est déjà annulé"
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED"
      }
    });

    return res.json({
      message: "Rendez-vous annulé avec succès",
      appointment: updatedAppointment
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
