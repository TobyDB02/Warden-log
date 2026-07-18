
const express = require('express');
const router = express.Router();
const controller = require('../controllers/entriesController');
const locations = require('../data/locations');

router.get('/locations', (req, res) => res.json(locations));

router.post('/entries', controller.createEntry);
router.get('/entries', controller.getAllEntries);
router.get('/entries/:staffNumber', controller.getEntryByStaffNumber);
router.put('/entries/:id', controller.updateEntry);
router.delete('/entries/:id', controller.deleteEntry);

module.exports = router;