const path = require("path");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/api/complete", (req, res) => {
  res.render("complete");
});
const IOhandler = require("./IOhandler");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathSeProcessed = path.join(__dirname, "sepia");
const pathBlurProcessed = path.join(__dirname, "blur");

app.post("/api/upload", upload.single("file"), (req, res) => {
  fileName = req.file.filename;
  const zipFilePath = path.join(__dirname, `/uploads/${fileName}`);
  IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(() => IOhandler.readDir(pathUnzipped))
    .then((imgs) => {
      const promises = imgs.map((img) => {
        return Promise.all([
          IOhandler.grayScale(img, pathProcessed),
          IOhandler.sepiaTone(img, pathSeProcessed),
          IOhandler.blur(img, pathBlurProcessed),
        ]);
      });
      return Promise.all(promises);
    })
    .then(() => {
      res.redirect("complete");
    })
    .catch((error) => {
      console.error("Error during processing:", error);
      res.status(500).send("An error occurred during file processing.");
    });
});

app.post("/api/grayscaled_download", (req, res) => {
  IOhandler.zip(pathProcessed)
    .then((zipPath) => {
      res.download(zipPath);
      console.log("download finished!");
    })
    .catch((error) => {
      console.error("Error during zip:", error);
      res.status(500).send("An error occurred during zip file creation.");
    });
});

app.post("/api/blur_download", (req, res) => {
  IOhandler.zip(pathBlurProcessed)
    .then((zipPath) => {
      res.download(zipPath);
      console.log("download finished!");
    })
    .catch((error) => {
      console.error("Error during zip:", error);
      res.status(500).send("An error occurred during zip file creation.");
    });
});

app.post("/api/sepia_download", (req, res) => {
  IOhandler.zip(pathSeProcessed)
    .then((zipPath) => {
      res.download(zipPath);
      console.log("download finished!");
    })
    .catch((error) => {
      console.error("Error during zip:", error);
      res.status(500).send("An error occurred during zip file creation.");
    });
});

app.listen(8000, () => {
  console.log("ImageConverter is running");
});
