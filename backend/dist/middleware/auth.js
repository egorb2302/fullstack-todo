"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_1 = require("../utils/auth");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
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
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        if (result.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = result[0];
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
