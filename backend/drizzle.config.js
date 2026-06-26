// import { defineConfig } from 'drizzle-kit';
// import dotenv from 'dotenv';

// dotenv.config();

// export default defineConfig({
//     schema: './src/db/schema.ts',
//     out: './src/db/migrations',
//     dialect: 'postgresql',
//     dbCredentials: {
//         url: process.env.DATABASE_URL!,
//     },
// });

const { defineConfig } = require('drizzle-kit');
require('dotenv').config();

module.exports = defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});