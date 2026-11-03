
let JWKS;

const verifyToken = async (req, res, next) => {
  try {
    const { createRemoteJWKSet, jwtVerify } = await import("jose");

    const authBaseURL =
      process.env.BETTER_AUTH_URL || "http://localhost:3000";

    if (!JWKS) {
      JWKS = createRemoteJWKSet(
        new URL(`${authBaseURL}/api/auth/jwks`)
      );
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authBaseURL,
      audience: authBaseURL,
    });

    if (!payload.sub || !payload.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token.",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || "",
      image: payload.image || "",
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = verifyToken;
