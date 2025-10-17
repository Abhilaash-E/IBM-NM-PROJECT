// ----------------------------------------------
// 📂 File Upload Manager - Single File Node.js App
// ----------------------------------------------
// Developed for Naan Muthalvan Project
// Features: Upload, View, Download, Delete files
// ----------------------------------------------

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Create upload directory if not exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

// File upload rules
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ["pdf", "png", "jpg", "jpeg", "gif", "docx", "txt"];
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Invalid file type!"));
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOAD_DIR));

// -------------------------------
// 🌐 Routes
// -------------------------------

// Home page — HTML UI + file list
app.get("/", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>File Upload Manager</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f2f2f2;
        padding: 40px;
      }
      .container {
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      h1 {
        text-align: center;
        color: #333;
      }
      form {
        text-align: center;
        margin-top: 20px;
      }
      .btn {
        background-color: #007bff;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 5px;
        text-decoration: none;
        cursor: pointer;
      }
      .btn:hover { background-color: #0056b3; }
      .file-list { margin-top: 30px; }
      .file-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        background-color: #fafafa;
        padding: 8px 10px;
        border-radius: 6px;
      }
      .file-item span { word-break: break-all; }
      footer { text-align: center; margin-top: 30px; color: #888; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>📂 File Upload Manager</h1>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file" required>
        <button class="btn" type="submit">Upload</button>
      </form>
      <div class="file-list">
        <h3>Uploaded Files</h3>
        ${
          files.length === 0
            ? "<p>No files uploaded yet.</p>"
            : files
                .map(
                  (file) => `
          <div class="file-item">
            <span>${file}</span>
            <span>
              <a class="btn" href="/download/${file}">Download</a>
              <a class="btn" href="/delete/${file}">Delete</a>
            </span>
          </div>
          `
                )
                .join("")
        }
      </div>
    </div>
    <footer>
      <p>Developed by <b>Vignesh L</b> — Naan Muthalvan Project</p>
    </footer>
  </body>
  </html>
  `);
});

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/");
});

// Download file
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) res.download(filePath);
  else res.send("<h3>File not found!</h3><a href='/'>Go Back</a>");
});

// Delete file
app.get("/delete/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.redirect("/");
  } else {
    res.send("<h3>File not found!</h3><a href='/'>Go Back</a>");
  }
});

// -------------------------------
// 🚀 Start Server
// -------------------------------
app.listen(PORT, () => {
  console.log(✅ File Upload Manager running on http://localhost:${PORT});
});