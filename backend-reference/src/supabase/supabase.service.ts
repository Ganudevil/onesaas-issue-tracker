import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
    private client: SupabaseClient;

    constructor() {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set');
            throw new Error('Supabase configuration missing');
        }

        this.client = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        console.log('Supabase Service Initialized with Service Role Key');
    }

    onModuleInit() {
        // Kept for interface compliance if needed, but logic moved to constructor
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
