module.exports = {
    usessl: true,
    sslport: 445, // 443?
    mainPort: 3001,
    key_file: './config/cert/localhost-key.pem',
    cert_file: './config/cert/localhost-cert.pem',
    ca_file: './config/cert/thawte.ca'
};
