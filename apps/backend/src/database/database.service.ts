import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private pool: Pool;

    constructor() {
        // Connect directly to Supabase PostgreSQL database
        if (process.env.DATABASE_URL) {
            // Production / Render Connection
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false, // Required for many cloud DBs (Supabase/Render)
                }
            });
            console.log('Database Service Initialized with DATABASE_URL');
        } else {
            // Localhost Fallback
            this.pool = new Pool({
                host: 'localhost',
                port: 54322,
                database: 'postgres',
                user: 'postgres',
                password: 'postgres',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 60000,
            });
            console.log('Database Service Initialized with Localhost Connection');
        }

        console.log('Database Service Initialized with Direct PostgreSQL Connection');
    }

    async onModuleInit() {
        try {
            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('Database connection verified');
        } catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }

    getPool(): Pool {
        return this.pool;
    }

    async query(text: string, params?: any[]) {
        try {
            const result = await this.pool.query(text, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
}
