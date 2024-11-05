const otplib = require("otplib");

// Generate TOTP secret for the user
const totpSecret = otplib.authenticator.generateSecret();

module.exports = [
    {
        username: "username",
        password: "password",
        totpSecret: "7VEBOEYS25P6BBRBTINZOHOKQ2EQCIG5"  // Secret to verify TOTP code
    },
    {
        username: "admin",
        password: "admin",
        totpSecret: "7ZBADPUMTZCY4WHKQHJTFOWOZPN6SM3I"  // Secret to verify TOTP code
    },
    {
        username: "test",
        password: "test",
        totpSecret: "D7T2X2YL3PK4GPJOR6HDX2VPQWI2CCGC"  // Secret to verify TOTP code
    },
    {
        username: "brayden",
        password: "password",
        totpSecret: "CNQWSEFV4HKWZ3DRCNJAK35MGVBMJCOX"  // Secret to verify TOTP code
    }
];