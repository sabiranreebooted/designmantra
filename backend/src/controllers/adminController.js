const { createHmac, timingSafeEqual } = require("crypto");
const { sign } = require("../middleware/adminAuth");

function safeEqual(first, second) {
  const firstHash = createHmac("sha256", "admin-credential-check").update(first).digest();
  const secondHash = createHmac("sha256", "admin-credential-check").update(second).digest();
  return timingSafeEqual(firstHash, secondHash);
}

function login(req, res) {
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_TOKEN_SECRET;
  const { email, password } = req.body || {};

  if (!configuredEmail || !configuredPassword || !secret || secret.length < 32) {
    return res.status(503).json({
      success: false,
      message: "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and a 32-character ADMIN_TOKEN_SECRET in the backend environment.",
    });
  }

  if (typeof email !== "string" || typeof password !== "string"
    || !safeEqual(email.trim().toLowerCase(), configuredEmail.trim().toLowerCase())
    || !safeEqual(password, configuredPassword)) {
    return res.status(401).json({ success: false, message: "Email or password is incorrect." });
  }

  const payload = Buffer.from(JSON.stringify({
    email: configuredEmail.trim().toLowerCase(),
    exp: Date.now() + (8 * 60 * 60 * 1000),
  })).toString("base64url");

  return res.json({
    success: true,
    data: {
      token: `${payload}.${sign(payload, secret)}`,
      email: configuredEmail.trim().toLowerCase(),
    },
  });
}

module.exports = { login };
