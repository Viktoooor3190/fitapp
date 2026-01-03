"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors = require("cors");
// Initialize CORS middleware
exports.corsMiddleware = cors({
    origin: ['http://localhost:3000', 'https://fitness-app-c3a9a.web.app', 'https://fitness-app-c3a9a.firebaseapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours in seconds
});
//# sourceMappingURL=corsMiddleware.js.map