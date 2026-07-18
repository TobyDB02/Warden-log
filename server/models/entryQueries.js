
const { getPool, sql } = require('../config/db');

async function createEntry({ staffNumber, firstName, surname, location}) {
    const pool = await getPool();
    const result = await pool.request()
        .input('staffNumber', sql.NVarChar, staffNumber)
        .input('firstName', sql.NVarChar, firstName)
        .input('surname', sql.NVarChar, surname)
        .input('location', sql.NVarChar, location)
        .query(`INSERT INTO FireWardenEntries (staffNumber, firstName, surname, location, timestamp, lastUpdated)
                OUTPUT INSERTED.*
                VALUES (@staffNumber, @firstName, @surname, @location, GETDATE(), GETDATE())`
        );
    return result.recordset[0];
}

async function getAllEntries() {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT * FROM FireWardenEntries ORDER BY lastUpdated DESC`);
    return result.recordset;
}

async function getEntryByStaffNumber(staffNumber) {
    const pool = await getPool();
    const result = await pool.request()
        .input('staffNumber', sql.NVarChar, staffNumber)
        .query('SELECT * FROM FireWardenEntries WHERE staffNumber = @staffNumber');
    return result.recordset[0];
}

async function updateEntry(id, {location, firstName, surname}) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('location', sql.NVarChar, location)
        .input('firstName', sql.NVarChar, firstName)
        .input('surname', sql.NVarChar, surname)
        .query(`
        UPDATE FireWardenEntries
        SET location = @location, firstName = @firstName, surname = @surname, lastUpdated = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id`
        );
    return result.recordset[0];
}

async function deleteEntry(id) {
    const pool = await getPool();
    const result = await pool.request()
        .input('id', sql.NVarChar, id)
        .query('DELETE FROM FireWardenEntries WHERE id = @id');
    return {deleted: true};
}

module.exports = {createEntry, getAllEntries, getEntryByStaffNumber, updateEntry, deleteEntry};