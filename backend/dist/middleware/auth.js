"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_1 = require("../utils/auth");
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ error: "No access token provided" });
        }
        let decoded;
        try {
            decoded = (0, auth_1.verifyAccessToken)(token);
        }
        catch (err) {
            if (err instanceof Error && err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token was expired" });
            }
            return res.status(401).json({ error: 'Invalid access token' });
        }
        const userId = Number(decoded.userId);
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Invalid user ID in token" });
        }
        req.user = { id: userId };
        next();
    }
    catch (err) {
        if (err instanceof Error && err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (err instanceof Error && err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token was expired" });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.authenticate = authenticate;
