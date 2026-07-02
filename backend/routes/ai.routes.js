const express = require("express");
const protect = require("../middleware/auth");

const router = express.Router();

const {
  chatController
} = require("../controllers/ai.controller");

router.post("/chat", protect, chatController);

module.exports = router;