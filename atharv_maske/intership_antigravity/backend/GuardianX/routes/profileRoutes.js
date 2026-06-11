const express = require("express");
const { createProfile, getProfile, updateProfile, deleteProfile } = require("../controller/profileController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createProfile);
router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);
router.delete("/", authenticate, deleteProfile);

module.exports = router;
