import multer from "multer";
import path from "path";

// Memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) cb(null, true);
    else cb(new Error("Only .jpeg, .jpg, .png, and .webp formats allowed"));
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter,
});