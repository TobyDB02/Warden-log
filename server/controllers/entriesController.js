
const entryQueries = require('../models/entryQueries');
const entryQuries = require("./entriesController");

exports.createEntry = async (req, res, next) => {
    try {
        const {staffNumber, fistName, surname, location} = req.body;
        if (!staffNumber || !fistName || !surname || !location) {
            return res.status(400).json({ error: 'Not all fields provided' });
        }
        const entry = await entryQueries.createEntry({staffNumber, firstName, surname, location});
        res.status(201).json(entry);
    } catch (err) {
        next(err);
    }
};

exports.getAllEntries = async (req, res, next) => {
    try {
        const entries = await entryQuries.getAllEntries();
        res.json(entries);
    } catch (err) {
        next(err);
    }
};

exports.getEntryByStaffNumber = async (req, res, next) => {
    try {
        const entry = await entryQuries.getEntryByStaffNumber(req.params.staffNumber);
        if (!entry) return res.status(404).json({ error: 'Not found' });
        res.json(entry);
    } catch (err) {
        next(err);
    }
};

exports.updateEntry = async (req, res, next) => {
    try {
        const updated = await entryQueries.updateEntry(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.deleteEntry = async (req, res, next) => {
    try{
        await entryQuries.deleteEntry(req.params.id);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};