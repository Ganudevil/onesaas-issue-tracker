import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private pool: Pool;

    constructor() {
        // Connect directly to Supabase PostgreSQL database
        this.pool = new Pool({
            host: 'localhost',
            port: 54322, // Supabase PostgreSQL port from docker-compose
            database: 'postgres',
            user: 'postgres',
            password: 'postgres', // Default Supabase local password
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 60000,
        });

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
