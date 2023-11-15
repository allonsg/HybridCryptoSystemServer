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

const decryptData = ({iv, key, text}) => {
    try {
    const decodedKey = forge.util.decode64(key)
    const decodedIv = forge.util.decode64(iv)
    const decryptedKey = PRIVATE_KEY.decrypt(decodedKey, 'RSA-OAEP');
    const decryptedIv = PRIVATE_KEY.decrypt(decodedIv, 'RSA-OAEP');

    const decipher = forge.cipher.createDecipher('DES-CBC', decryptedKey);
    decipher.start({iv: decryptedIv});
    decipher.update(forge.util.createBuffer(forge.util.decode64(text)));
    decipher.finish();

    return decipher.output.toString();
    } catch (error) {
        console.error(error)
        throw new CryptoApiError('Failed to decrypt data');
    }
};

module.exports = {
    getPublicKey,
    decryptData,
};
