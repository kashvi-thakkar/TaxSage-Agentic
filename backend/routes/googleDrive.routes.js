const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();

const googleDrive =
    require("../integrations/googleDrive/googleDrive.integration");


// Login

router.get("/login", (req, res) => {

    const url = googleDrive.getAuthUrl();

    res.redirect(url);

});


// Callback

router.get("/callback", async (req, res) => {

    try {

        const { code } = req.query;

        const tokens =
            await googleDrive.getToken(code);

        console.log("GOOGLE TOKENS:");
        const files =
            await googleDrive.listPdfFiles();

        res.json({

            success: true,

            files

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

router.post("/download", async (req, res) => {

    try {
        const {fileId, fileName, accessToken} = req.body;

    const pdf =
        await googleDrive.downloadFile(fileId, accessToken);

        const uploadPath = path.join(

            __dirname,

            "../uploads",

            fileName || "form16.pdf"

        );

        fs.writeFileSync(uploadPath, Buffer.from(pdf));

        const { processFilingController } =
            require("../controllers/langgraph.controller");

        req.file = {
            path: uploadPath,
            filename: fileName
        };

        return processFilingController(req, res);

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;