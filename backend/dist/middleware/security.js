"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const security_config_1 = __importDefault(require("../config/security.config"));
exports.securityMiddleware = [
    (0, helmet_1.default)(security_config_1.default.helmetConfig),
    (0, cors_1.default)(security_config_1.default.corsConfig),
    (0, express_rate_limit_1.rateLimit)(security_config_1.default.rateLimitConfig),
];
