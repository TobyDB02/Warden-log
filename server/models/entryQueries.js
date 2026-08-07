const { getPool, sql } = require('../config/db.js');

exports.createEntry = async ({ staffNumber, firstName, surname, location }) => {
    const pool = await getPool();
    const now = new Date();

    const result = await pool.request()
        .input('staffNumber', sql.NVarChar(20), staffNumber)
        .input('firstName', sql.NVarChar(50), firstName)
        .input('surname', sql.NVarChar(50), surname)
        .input('location', sql.NVarChar(100), location)
        .input('timestamp', sql.DateTime, now)
        .input('lastUpdated', sql.DateTime, now)
        .query(`
            INSERT INTO dbo.FireWardenEntries (staffNumber, firstName, surname, location, timestamp, lastUpdated)
                OUTPUT INSERTED.*
            VALUES (@staffNumber, @firstName, @surname, @location, @timestamp, @lastUpdated)
        `);

    return result.recordset[0];
};

exports.getAllEntries = async () => {
    const pool = await getPool();
    const result = await pool.request()
        .query('SELECT * FROM dbo.FireWardenEntries');

    return result.recordset;
};

exports.getEntryByStaffNumber = async (staffNumber) => {
    const pool = await getPool();
    const result = await pool.request()
        .input('staffNumber', sql.NVarChar(20), staffNumber)
        .query('SELECT * FROM dbo.FireWardenEntries WHERE staffNumber = @staffNumber');

    return result.recordset[0] || null;
};

exports.updateEntry = async (id, { firstName, surname, location }) => {
    const pool = await getPool();
    const now = new Date();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('firstName', sql.NVarChar(50), firstName)
        .input('surname', sql.NVarChar(50), surname)
        .input('location', sql.NVarChar(100), location)
        .input('lastUpdated', sql.DateTime, now)
        .query(`
            UPDATE dbo.FireWardenEntries
            SET firstName = @firstName, surname = @surname, location = @location, lastUpdated = @lastUpdated
                OUTPUT INSERTED.*
            WHERE id = @id
        `);

    return result.recordset[0] || null;
};

exports.deleteEntry = async (id) => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM dbo.FireWardenEntries
            OUTPUT DELETED.*
            WHERE id = @id
        `);

    return result.recordset[0] || null;
};