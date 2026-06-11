const express = require("express");
const { getHelloWorld } = require("../controller/helloContainer");

const router = express.Router();

router.get("/hello", getHelloWorld);

module.exports = router;