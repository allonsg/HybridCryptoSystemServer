const {CryptoApiError} = require("../helpers/errors");
const forge = require('node-forge');
const rsa = forge.pki.rsa;

let PRIVATE_KEY;
let PUBLIC_KEY;

rsa.generateKeyPair({bits: 2048, workers: 2}, function (err, keypair) {
    if (err) {
        throw new CryptoApiError('Failed to generate key pair');
    }
    PRIVATE_KEY = keypair.privateKey;
    PUBLIC_KEY = keypair.publicKey;
});

const getPublicKey = () => {
    try {
        const publicKey = forge.pki.publicKeyToPem(PUBLIC_KEY)
        return publicKey;
    } catch (error) {
        throw new CryptoApiError('Failed to get public key');
    }
};

const decryptData = ({iv, key: encryptedKey, text}) => {
    try {
        const decryptedKey = PRIVATE_KEY.decrypt(forge.util.decode64(encryptedKey), 'RSA-OAEP');
        const decryptedIv = PRIVATE_KEY.decrypt(forge.util.decode64(iv), 'RSA-OAEP');

        const decipher = forge.cipher.createDecipher('AES-CBC', decryptedKey);
        decipher.start({iv: decryptedIv});
        decipher.update(forge.util.createBuffer(forge.util.decode64(text)));
        decipher.finish();

        const decryptedMessage = decipher.output.toString();
        return decryptedMessage;
    } catch (error) {
        throw new CryptoApiError('Failed to decrypt data');
    }
};

module.exports = {
    getPublicKey,
    decryptData,
};
