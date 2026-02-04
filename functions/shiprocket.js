const axios = require("axios");
const { defineString } = require("firebase-functions/params");

/* 🔐 ENV PARAMS (Gen-2 SAFE) */
const SHIPROCKET_EMAIL = defineString("SHIPROCKET_EMAIL");
const SHIPROCKET_PASSWORD = defineString("SHIPROCKET_PASSWORD");

/* 🔁 TOKEN CACHE */
let shiprocketToken = null;
let tokenExpiry = null;

/* 🔐 GET / CACHE SHIPROCKET TOKEN */
async function getShiprocketToken() {
  // Reuse token if valid
  if (shiprocketToken && tokenExpiry > Date.now()) {
    return shiprocketToken;
  }

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: SHIPROCKET_EMAIL.value(),
      password: SHIPROCKET_PASSWORD.value(),
    },
  );

  shiprocketToken = res.data.token;

  // Shiprocket token valid ~10 days
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;

  return shiprocketToken;
}

module.exports = {
  getShiprocketToken,
};
