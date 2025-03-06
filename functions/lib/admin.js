"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin once
const app = (0, app_1.initializeApp)();
exports.app = app;
const db = (0, firestore_1.getFirestore)();
exports.db = db;
//# sourceMappingURL=admin.js.map