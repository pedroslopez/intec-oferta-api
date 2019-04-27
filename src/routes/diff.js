const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Change } = require('../models');

const changeCleanup = record => {
    return {
        code: record.code,
        section: record.section,
        type: record.type,
        field: record.field,
        oldValue: record.oldValue,
        newValue: record.newValue,
        date: record.createdAt
    }
};

router.get('/', asyncHandler(async (req, res) => {
    try {
        let changes = await Change.find({}).sort('-createdAt').limit(25).lean().exec();
        res.json({success: true, changes: changes.map(changeCleanup)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

router.get('/:code', asyncHandler(async (req, res) => {
    try {
        let changes = await Change.find({code: req.params.code}).sort('-createdAt').limit(25).lean().exec();
        res.json({success: true, changes: changes.map(changeCleanup)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

router.get('/:code/:section', asyncHandler(async (req, res) => {
    try {
        let changes = await Change.find({code: req.params.code, section: req.params.section}).sort('-createdAt').limit(25).lean().exec();
        res.json({success: true, changes: changes.map(changeCleanup)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

module.exports = router;