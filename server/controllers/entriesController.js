const entryQueries = require('../models/entryQueries');

exports.createEntry = async (req, res, next) => {
    try {
        const {
            staffNumber,
            firstName,
            surname,
            location
        } = req.body;

        if (
            !staffNumber ||
            !firstName ||
            !surname ||
            !location
        ) {
            return res.status(400).json({
                error: 'Not all fields provided'
            });
        }

        const entry = await entryQueries.createEntry({
            staffNumber,
            firstName,
            surname,
            location
        });

        res.status(201).json(entry);
    } catch (err) {
        next(err);
    }
};

exports.getAllEntries = async (req, res, next) => {
    try {
        const entries = await entryQueries.getAllEntries();

        res.json(entries);
    } catch (err) {
        next(err);
    }
};

exports.getEntryByStaffNumber = async (req, res, next) => {
    try {
        const entry =
            await entryQueries.getEntryByStaffNumber(
                req.params.staffNumber
            );

        if (!entry) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.json(entry);
    } catch (err) {
        next(err);
    }
};

exports.updateEntry = async (req, res, next) => {
    try {
        const updated =
            await entryQueries.updateEntry(
                req.params.id,
                req.body
            );

        if (!updated) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.deleteEntry = async (req, res, next) => {
    try {
        const deleted =
            await entryQueries.deleteEntry(
                req.params.id
            );

        if (!deleted) {
            return res.status(404).json({
                error: 'Not found'
            });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};