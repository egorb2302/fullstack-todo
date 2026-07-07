"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const logger_1 = __importDefault(require("./middleware/logger"));
const env_1 = require("./config/env");
const index_1 = require("./redis/index");
const reportWorker_1 = require("./queues/workers/reportWorker");
const app_1 = require("./app");
async function startServer() {
    try {
        await (0, index_1.connectRedis)();
        logger_1.default.info('Redis ready, cache enabled');
    }
    catch {
        logger_1.default.warn('Redis unavailable, starting without cache');
    }
    (0, reportWorker_1.startReportWorker)();
    exports.server = app_1.app.listen(env_1.env.PORT, () => {
        logger_1.default.info(`Server is running on localhost:${env_1.env.PORT}`);
    });
}
void startServer();
