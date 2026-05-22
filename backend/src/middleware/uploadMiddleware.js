import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "src/uploads"),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];
  cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
