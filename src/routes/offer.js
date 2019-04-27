const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { Section } = require('../models');

const sectionCleanup = record => {
    return {
        code: record.code,
        section: record.section,
        name: record.name,
        credits: record.credits,
        professor: record.professor,
        room: record.room,
        schedule: record.schedule
    }
};

router.get('/', asyncHandler(async (req, res) => {
    try {
        let sections = await Section.find({}).lean().exec();
        res.json({success: true, sections: sections.map(sectionCleanup)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

router.get('/:code', asyncHandler(async (req, res) => {
    try {
        let sections = await Section.find({code: req.params.code}).sort('section').lean().exec();
        res.json({success: true, sections: sections.map(sectionCleanup)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

router.get('/:code/:section', asyncHandler(async (req, res) => {
    try {
        let section = await Section.findOne({code: req.params.code, section: req.params.section}).lean().exec();
        res.json({success: true, section: sectionCleanup(section)});
    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

module.exports = router;