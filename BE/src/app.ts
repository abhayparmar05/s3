import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { uploadToS3, listS3Files, deleteS3File } from "./s3/s3";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Multer → store temporarily before S3 upload
const upload = multer({
  dest: "uploads/",
});

// Upload API
app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join("uploads", req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);

    const s3Url = await uploadToS3(
      fileBuffer,
      `${Date.now()}_${req.file.originalname}`,
      req.file.mimetype
    );

    fs.unlinkSync(filePath); // remove temp file

    res.json({ message: "Uploaded successfully", url: s3Url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// List files API
app.get("/files", async (req: Request, res: Response) => {
  try {
    const files = await listS3Files();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Error listing files" });
  }
});

// Delete file API
app.delete("/delete/:key", async (req: Request, res: Response) => {
  try {
    const fileKey = req.params.key;
    await deleteS3File(fileKey);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
