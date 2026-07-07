const { defineConfig } = require('drizzle-kit');
require('dotenv').config();

module.exports = defineConfig({
    out: './src/db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});