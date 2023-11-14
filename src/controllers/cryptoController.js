const {getPublicKey, decryptData} = require("../services/cryptoService");

const getPublicKeyController = (req, res) => {
    const publicKey = getPublicKey()

    res.status(200).json(publicKey);
};

const postDecryptController = (req, res) => {
    const  { iv, key, text } = req.body;

    const decryptedData = decryptData({ iv, key, text });

    res.status(200).json(decryptedData);
}

module.exports = {
    getPublicKeyController,
    postDecryptController
}