const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const emailValidator = require("email-validator");

const { Subscription } = require('../models');

router.post('/', asyncHandler(async (req, res) => {
    let body = {
        code: req.body.code,
        email: req.body.email,
        options: req.body.options
    }

    if(!body.code || !body.email || !body.options || !Array.isArray(body.options)) {
        return res.status(400).json({success: false, message: 'Code, email and options fields must be specified!'});
    }

    if(!emailValidator.validate(body.email)) {
        return res.status(400).json({success: false, message: 'Invalid email address'});
    }

    if(body.options.length == 0) {
        return res.status(400).json({success: false, message: 'At least one option must be speicified'});
    }

    if(!body.options.every(x => x.startsWith('CREATE') || x.startsWith('DELETE') || x.startsWith('UPDATE_'))) {
        return res.status(400).json({success: false, message: 'Invalid options'});
    }

    try {
        let subscription = await Subscription.findOneAndUpdate({
            code: body.code, email: body.email
        }, {
            $addToSet: {types: body.options}
        }, {
            new: true,
            upsert: true
        }).lean().exec();

        res.json({success: true, subscription});

    } catch(err) {
        res.status(500).json({success: false, message: 'An error ocurred while processing your request.'});
    }
}));

module.exports = router;