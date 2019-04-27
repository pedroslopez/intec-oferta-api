const axios = require('axios');
const cheerio = require('cheerio');
const tough = require('tough-cookie');

const axiosCookieJarSupport = require('axios-cookiejar-support').default;
axiosCookieJarSupport(axios);

const BASE_URL = "https://procesos.intec.edu.do";
const OFFER_ROUTE = "/OfertaAcademica/Index";

const parseOffer = offerHtml => {
    let $ = cheerio.load(offerHtml);

    let sections = [];

    $('tbody.title').each((i, el) => {
        const $el = $(el);

        let classInfo = {
            code: $el.attr('id').split('Asignatura-')[1],
            name: $el.find('td:nth-child(2)').text().split(' - ')[2].replace(/ +(?= )/g,''),
            credits: $el.find('td:nth-child(3)').text()
        }

        $el.next().find('tr tbody tr').each((i, sectEl) => {
            let $sectEl = $(sectEl);
            let sectionInfo = {
                ...classInfo,
                type: $sectEl.find('td:nth-child(1)').text(),
                section: $sectEl.find('td:nth-child(2)').text(),
                room: $sectEl.find('td:nth-child(3)').text(),
                professor: $sectEl.find('td:nth-child(4)').text().replace(/ +(?= )/g,''),
                schedule: $sectEl.find('td:nth-last-child(-n+6)').map((i, el) => $(el).text()).get(),
            }

            sections.push(sectionInfo);
        });
    });

    return sections;
}

const scrapeOffer = async (login) => {
    const cookieJar = new tough.CookieJar();

    const intec = axios.create({
        jar: cookieJar,
        baseURL: BASE_URL,
        withCredentials: true
    });

    console.log('Logging in...');

    await intec.post('/', {
        txtID: login.id,
        txtUserPass: login.pin
    }, {
        maxRedirects: 0,
        validateStatus: (status) => {
            return status == 302; // only allow redirect (login succesful)
        },
    });

    console.log('Getting offer...');
    const offerRes = await intec.get(OFFER_ROUTE);

    console.log('Parsing offer...');
    let offer = parseOffer(offerRes.data);

    console.log(`${offer.length} classes scraped!`);

    return offer;

}

module.exports = scrapeOffer;