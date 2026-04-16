
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function migrate() {
    console.log("Starting migration...");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    if (!connectionString) {
        throw new Error("No POSTGRES_URL found in environment variables.");
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to Supabase Postgres.");

        const schemaPath = path.join(process.cwd(), 'src/lib/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Applying schema...");
        await client.query(schemaSql);
        console.log("Schema applied successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
