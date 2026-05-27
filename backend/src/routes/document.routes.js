import express from "express";
import multer from "multer";
import path from "path";
import { uploadDocument, getMyDocuments, deleteDocument } from "../controllers/document.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadDocument);
router.get("/", authenticate, getMyDocuments);
router.delete("/:id", authenticate, deleteDocument);

export default router;
