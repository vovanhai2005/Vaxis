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

export const editVaccine = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, manufacturer, description, price } = req.body;

    const result = await sql`
      UPDATE vaccines
      SET
        code = COALESCE(${code}, code),
        name = COALESCE(${name}, name),
        manufacturer = COALESCE(${manufacturer}, manufacturer),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error editing vaccine:", error);
    res.status(500).json({ error: "Unable to edit vaccine" });
  }
};

export const deleteVaccine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM vaccines
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Vaccine not found" });
    }

    res.status(200).json({ message: "Vaccine deleted", deleted: result[0] });
  } catch (error) {
    console.error("Error deleting vaccine:", error);

    if (error.constraint) {
      // foreign key violation
      return res.status(400).json({
        error: "Cannot delete vaccine because it is being used",
      });
    }

    res.status(500).json({ error: "Unable to delete vaccine" });
  }
};

