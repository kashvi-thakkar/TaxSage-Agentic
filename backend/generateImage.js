const { fromPath } = require("pdf2pic");
const path = require("path");
const fs = require("fs");

async function run() {

  const pdfPath = path.join(
    __dirname,
    "uploads",
    "1780295798624-1_Form16_Sample.pdf"
  );

  const outputDir = path.join(
    __dirname,
    "temp"
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const convert = fromPath(pdfPath, {
    density: 300,
    saveFilename: "form16",
    savePath: outputDir,
    format: "png"
  });

  const result = await convert(1);

  console.log(result);
}

run();