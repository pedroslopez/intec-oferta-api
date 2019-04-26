const axios = require('axios');
const cheerio = require('cheerio');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

const BASE_URL = "https://procesos.intec.edu.do";
const OFFER_ROUTE = "/OfertaAcademica/Index";

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

const intec = axios.create({
    jar: cookieJar,
    baseURL: BASE_URL,
    withCredentials: true
});

const parseOffer = async (offerHtml) => {
    let $ = cheerio.load(offerHtml);

    let classesByCode = {};

    $('tbody.title').each((i, el) => {
        const $el = $(el);

        let classInfo = {
            code: $el.attr('id').split('Asignatura-')[1],
            name: $el.find('td:nth-child(2)').text(),
            credits: $el.find('td:nth-child(3)').text()
        }

        if(!(classInfo.code in classesByCode)) {
            classesByCode[classInfo.code] = [];
        }

        $el.next().find('tr tbody tr').each((i, sectEl) => {
            let $sectEl = $(sectEl);
            let sectionInfo = {
                ...classInfo,
                type: $sectEl.find('td:nth-child(1)').text(),
                section: $sectEl.find('td:nth-child(2)').text(),
                professor: $sectEl.find('td:nth-child(4)').text(),
                schedule: $sectEl.find('td:nth-last-child(-n+6)').map((i, el) => $(el).text()).get(),
            }

            classesByCode[classInfo.code].push(sectionInfo);
        })
    });

    return classesByCode;
}

const scrapeOffer = async (login) => {
    console.log('Logging in...');

    const loginRes = await intec.post('/', {
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
    const offer = parseOffer(offerRes.data);

}

module.exports = scrapeOffer;