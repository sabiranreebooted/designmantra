const { createHmac, timingSafeEqual } = require("crypto");

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Please sign in to continue." });
  }

  if (!secret || secret.length < 32) {
    return res.status(503).json({
      success: false,
      message: "Admin authentication is not configured. Set ADMIN_TOKEN_SECRET in the backend environment.",
    });
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    return res.status(401).json({ success: false, message: "Your session is invalid. Please sign in again." });
  }

  const expected = Buffer.from(sign(payload, secret));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    return res.status(401).json({ success: false, message: "Your session is invalid. Please sign in again." });
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.email || session.exp <= Date.now()) {
      return res.status(401).json({ success: false, message: "Your session has expired. Please sign in again." });
    }

    req.admin = { email: session.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Your session is invalid. Please sign in again." });
  }
}

module.exports = { requireAdmin, sign };
