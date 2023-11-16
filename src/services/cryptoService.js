const {CryptoApiError} = require("../helpers/errors");
const forge = require('node-forge');
const fs = require('fs');
const pki = forge.pki;

const PASSWORD = "UgbajaGabriel";

const createCertificate = (password) => {
    const keys = pki.rsa.generateKeyPair(1024);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    const attrs = [{
        name: 'commonName',
        value: 'example.org'
    }, {
        name: 'countryName',
        value: 'US'
    }, {
        shortName: 'ST',
        value: 'Virginia'
    }, {
        name: 'localityName',
        value: 'Blacksburg'
    }, {
        name: 'organizationName',
        value: 'Test'
    }, {
        shortName: 'OU',
        value: 'Test'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([{
        name: 'basicConstraints',
        cA: true
    }, {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
    }, {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
    }, {
        name: 'nsCertType',
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
    }, {
        name: 'subjectAltName',
        altNames: [{
            type: 6, // URI
            value: 'http://example.org/webid#me'
        }, {
            type: 7, // IP
            ip: '127.0.0.1'
        }]
    }, {
        name: 'subjectKeyIdentifier'
    }]);
    cert.sign(keys.privateKey);

    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, {algorithm: "3des"});
    const p12Buffer = forge.asn1.toDer(p12Asn1).getBytes();
    const p12b64 = forge.util.encode64(p12Buffer);
    return p12b64;
};

let cert64
try {
    const store = fs.readFileSync('certificates.p12', 'binary');
    cert64 = store
} catch (error) {
    cert64 = createCertificate(PASSWORD);
    fs.writeFileSync('certificates.p12', cert64);
}

const getKeysFromCert = () => {
    const p12Der = forge.util.decode64(cert64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, PASSWORD);
    const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
    const cert = certBags[forge.pki.oids.certBag][0];
    const publicKey = cert.cert.publicKey;
    const keyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
    const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
    return {publicKey, privateKey}
};

const getPublicKey = () => {
    try {
        const {publicKey} = getKeysFromCert()
        return pki.publicKeyToPem(publicKey);
    } catch (error) {
        throw new CryptoApiError('Failed to get public key');
    }
};

const decryptData = ({iv, key, text}) => {
    try {
        const {privateKey} = getKeysFromCert()

        const decryptedKey = privateKey.key.decrypt(forge.util.decode64(key), 'RSA-OAEP');
        const decryptedIv = privateKey.key.decrypt(forge.util.decode64(iv), 'RSA-OAEP');

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
