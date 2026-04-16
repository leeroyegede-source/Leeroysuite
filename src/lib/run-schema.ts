import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runSchema() {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error("Error: DATABASE_URL or POSTGRES_URL environment variable is missing.");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase usually
    });

    try {
        await client.connect();
        console.log("Connected to database...");

        const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Running schema update...");
        await client.query(sql);

        console.log("Schema updated successfully!");
    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await client.end();
    }
}

runSchema();
