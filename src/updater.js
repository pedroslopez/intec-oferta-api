const mongoose = require('mongoose');
const arg = require('arg');

const { MONGO_URL } = require('./config');
const { scrapeOffer, computeChanges, notifyChanges } = require('./scripts');

const args = arg({
    // Types
    '--user':     String,
    '--password': String,
 
    // Aliases
    '-u':         '--user',
    '-p':         '--password',
    '--pin':      '--password'
});

if(!args['--user'] || !args['--password']) {
    console.error('--user (-u) and --password (-p) arguments are required!');
    return false;
}

const login = {id: args['--user'], pin: args['--password']};

(async () => {
    console.log('Get and parse offer...');
    const offer = await scrapeOffer(login);

    mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });
    mongoose.connection.on('connected', () => {
        console.log('Connected to database');
    });

    console.log('Compute diff...');
    const diff = await computeChanges(offer);

    console.log('Notifying... (Not implemented)');
    await notifyChanges(diff);

    mongoose.connection.close();
})();
