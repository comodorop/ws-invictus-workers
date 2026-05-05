"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dotenv = require("dotenv");
dotenv.config();
const config = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'invicter',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
        directory: (0, path_1.join)(__dirname, 'src/database/migrations'),
        extension: 'ts',
        tableName: 'knex_migrations',
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map