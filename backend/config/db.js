import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Neon database connection configuration
const pool = new Pool({
  connectionString: process.env.PG_DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false // Use this if you're having SSL certificate issues
  }
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to Neon PostgreSQL database');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default pool;