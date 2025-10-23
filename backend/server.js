import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';    
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Initialize environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

async function initDB() {
    try {
        // Connect to the Neon database
        const pool = await connectDB();
        
        // Create ENUM types first
        await pool.query(`
            DO $$ 
            BEGIN
                -- Create ENUM types if they don't exist
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
                    CREATE TYPE role_type AS ENUM ('citizen', 'employee', 'manager');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
                    CREATE TYPE appointment_status AS ENUM ('booked', 'checked_in', 'completed', 'cancelled', 'no_show');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
                    CREATE TYPE notification_type AS ENUM ('reminder', 'news', 'system');
                END IF;
            END $$;
        `);
        
        // Create tables
        await pool.query(`
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role role_type NOT NULL,
                full_name TEXT,
                phone TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            
            -- Citizens table
            CREATE TABLE IF NOT EXISTS citizens (
                id BIGSERIAL PRIMARY KEY,
                user_id UUID NOT NULL UNIQUE REFERENCES users(id),
                national_id TEXT UNIQUE,
                birth_date DATE,
                gender TEXT,
                address TEXT,
                emergency_contact TEXT
            );
            
            -- Employees table
            CREATE TABLE IF NOT EXISTS employees (
                id BIGSERIAL PRIMARY KEY,
                user_id UUID NOT NULL UNIQUE REFERENCES users(id),
                employee_number TEXT UNIQUE,
                role_title TEXT,
                active BOOLEAN DEFAULT TRUE
            );
            
            -- Vaccines table
            CREATE TABLE IF NOT EXISTS vaccines (
                id BIGSERIAL PRIMARY KEY,
                code TEXT UNIQUE,
                name TEXT NOT NULL,
                manufacturer TEXT,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- Vaccine lots table
            CREATE TABLE IF NOT EXISTS vaccine_lots (
                id BIGSERIAL PRIMARY KEY,
                vaccine_id BIGINT NOT NULL REFERENCES vaccines(id),
                lot_number TEXT NOT NULL,
                quantity BIGINT DEFAULT 0,
                expiry_date DATE,
                received_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (vaccine_id, lot_number)
            );
            
            CREATE INDEX IF NOT EXISTS idx_vaccine_lots_vaccine_expiry ON vaccine_lots(vaccine_id, expiry_date);
            
            -- Appointments table
            CREATE TABLE IF NOT EXISTS appointments (
                id BIGSERIAL PRIMARY KEY,
                citizen_id BIGINT NOT NULL REFERENCES citizens(id),
                scheduled_at TIMESTAMPTZ NOT NULL,
                status appointment_status DEFAULT 'booked',
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_appointments_citizen_scheduled ON appointments(citizen_id, scheduled_at);
            
            -- Bills table
            CREATE TABLE IF NOT EXISTS bills (
                id BIGSERIAL PRIMARY KEY,
                citizen_id BIGINT NOT NULL REFERENCES citizens(id),
                amount_cents BIGINT DEFAULT 0,
                paid BOOLEAN DEFAULT FALSE,
                issued_at TIMESTAMPTZ DEFAULT NOW(),
                paid_at TIMESTAMPTZ
            );
            
            -- Administrations table (needs bills to exist first)
            CREATE TABLE IF NOT EXISTS administrations (
                id BIGSERIAL PRIMARY KEY,
                appointment_id BIGINT REFERENCES appointments(id),
                citizen_id BIGINT NOT NULL REFERENCES citizens(id),
                vaccine_id BIGINT NOT NULL REFERENCES vaccines(id),
                vaccine_lot_id BIGINT REFERENCES vaccine_lots(id),
                administered_at TIMESTAMPTZ DEFAULT NOW(),
                dose_number INT,
                adverse_events TEXT,
                bill_id BIGINT REFERENCES bills(id)
            );
            
            CREATE INDEX IF NOT EXISTS idx_administrations_citizen_time ON administrations(citizen_id, administered_at);
            
            -- Certificates table
            CREATE TABLE IF NOT EXISTS certificates (
                id BIGSERIAL PRIMARY KEY,
                citizen_id BIGINT NOT NULL REFERENCES citizens(id),
                administration_id BIGINT REFERENCES administrations(id),
                generated_at TIMESTAMPTZ DEFAULT NOW(),
                pdf_path TEXT,
                hash TEXT
            );
            
            -- Notifications table
            CREATE TABLE IF NOT EXISTS notifications (
                id BIGSERIAL PRIMARY KEY,
                citizen_id BIGINT REFERENCES citizens(id),
                type notification_type NOT NULL,
                subject TEXT,
                body TEXT,
                sent_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                delivered BOOLEAN DEFAULT FALSE
            );
            
            -- Audit logs table
            CREATE TABLE IF NOT EXISTS audit_logs (
                id BIGSERIAL PRIMARY KEY,
                user_id UUID,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                details JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.log('Error initDB:', error);
        process.exit(1);
    }
}

initDB();

app.get('/test', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});