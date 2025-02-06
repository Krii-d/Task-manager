const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../storage/");

const genericUploadFiles = async (files, folder) => {
  try {
    const allowedMines = [".png", ".jpg", ".jpeg", ".pdf"];
    const file = files;

    if (!file || !file.name) {
      throw new Error("File object or file name is undefined");
    }

    console.log(file);
    console.log(file.name);
    const ext = file.name.split(".").pop();
    if (!allowedMines.includes(`.${ext}`)) {
      throw new Error("Invalid File Type");
    }

    // let dir = path.join(UPLOAD_DIR, folder);
    const dir = UPLOAD_DIR + folder;

    console.log(dir);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileName = `/${new Date().toISOString().replace(/[:.]/g, "-")}_${
      file.name
    }`;

    console.log(fileName);

    await file.mv(path.join(dir, fileName));

    return `${folder}${fileName}`;
  } catch (err) {
    console.error(err);
    return null;
  }
};
module.exports = {
  genericUploadFiles,
};
