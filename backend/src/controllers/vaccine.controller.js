import { sql } from '../config/db.js';

export const getVaccines = async (req, res) => {
    try {
        const vaccines = await sql`SELECT * FROM vaccines`;
        res.status(200).json(vaccines);
    } catch (error) {
        console.error('Error fetching vaccines:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getVaccinesByID = async (req, res) => {
    try {
        const { id } = req.params;
        const vaccine = await sql`SELECT * FROM vaccines WHERE id = ${id}`;
        if (vaccine.length === 0) {
            return res.status(404).json({ message: 'Vaccine not found.' });
        }
        res.status(200).json(vaccine[0]);
    } catch (error) {
        console.error('Error fetching vaccine by ID:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const addVaccine = async (req, res) => {
    try {
        const { code, name, manufacturer, description, price } = req.body;
        const newVaccine = await sql`
            INSERT INTO vaccines (code, name, manufacturer, description, price) 
            VALUES (${code}, ${name}, ${manufacturer}, ${description}, ${price}) 
            RETURNING *
        `;
        res.status(201).json(newVaccine[0]);
    } catch (error) {
        console.error('Error adding new vaccine:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};