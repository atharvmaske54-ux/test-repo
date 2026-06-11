const express = require("express");
const { registerUser, loginUser, deleteUser } = require("../controller/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/delete", authenticate, deleteUser);

module.exports = router;
