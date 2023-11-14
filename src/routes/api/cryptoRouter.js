const express = require("express");

const {
    getPublicKeyController,
    postDecryptController,
} = require("../../controllers/cryptoController");


const router = express.Router();

router.get("/public-key", getPublicKeyController);
router.post("/decrypt", postDecryptController);

module.exports = router;
