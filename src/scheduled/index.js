const scrapeOffer = require('./scripts/scrape');
const computeChanges = require('./scripts/changes');

const login = {id: '', pin: ''};

(async () => {
    console.log('Get and parse offer...');
    const offer = await scrapeOffer(login);

    console.log('Compute diff...');
    const diff = await computeChanges(offer);

    console.log('Notifying...')
    // TODO
})();
