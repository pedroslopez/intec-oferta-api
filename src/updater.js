const arg = require('arg');

const { scrapeOffer, computeChanges } = require('./scripts');

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

    console.log('Compute diff...');
    const diff = await computeChanges(offer);

    console.log('Notifying... (Not implemented)')
    // TODO
})();
