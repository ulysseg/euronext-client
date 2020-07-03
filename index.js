const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');

// Exemple https://live.euronext.com/en/ajax/getDetailedQuote/FR0000133308-XPAR
// Le site fonctionne en mode pull, le navigateur appelle regulierement la route en question
const EURONEXT_URL = 'https://live.euronext.com/en/ajax/getDetailedQuote/';
const EURONEXT_FULL_QUOTE_URL = 'https://live.euronext.com/en/intraday_chart/getDetailedQuoteAjax/';
const USER_AGENT = 'Mozilla/5.0';



async function getDetailedQuote(isin, market) {
    const url = new URL(`${isin}-${market}`, EURONEXT_URL);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            // 24/05/2020 User agent n'est pas necessaire pour fonctionner mais permet
            // d'etre plus discret quand meme
            'User-Agent': USER_AGENT,
            // 'Origin': 'https://live.euronext.com',
            // Sans cela, reponse vide
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
     },
        body: 'theme_name=euronext_live'
    });
    const html = await response.text();
    const root = HTMLParser.parse(html);
    const instrumentName = root.querySelector('#header-instrument-name').text.trim();
    const price = Number(root.querySelector('#header-instrument-price').innerHTML);
    return new DetailedQuote(instrumentName, price);
}

// URL interressante qui donne 52 week high/low 
// https://live.euronext.com/en/intraday_chart/getDetailedQuoteAjax/FR0000133308-XPAR/full
async function getFullDetailedQuote(isin, market) {
    const url = new URL(`${isin}-${market}/full`, EURONEXT_FULL_QUOTE_URL);
    const response = await fetch(url, {
        method: 'GET', // GET this time
        headers: { 
            // 24/05/2020 User agent n'est pas necessaire pour fonctionner mais permet
            // d'etre plus discret quand meme
            'User-Agent': USER_AGENT,
     }
    });
    const html = await response.text();
    const root = HTMLParser.parse(html);
    // TODO trouver la TR 52 week, moins pire des solutions
    const tds = root.querySelectorAll('td');
    let _52weekLow, _52weekHigh;
    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.text === '52 Week') {
            tokens = tds[i+1].text.split(/\s+/);
            _52weekLow = Number(tokens[2]);
            _52weekHigh = Number(tokens[4]);
            break;
        }
    }
    // TODO when not found
    return new FullDetailedQuote(_52weekLow, _52weekHigh);
}

class DetailedQuote {
    constructor(instrumentName, instrumentPrice) {
        this.instrumentName = instrumentName;
        this.instrumentPrice = instrumentPrice;
    }
}

class FullDetailedQuote {
    constructor(_52weekLow, _52weekHigh) {
        this._52weekLow = _52weekLow;
        this._52weekHigh = _52weekHigh;
    }
}

async function main() {
    const quote = await getFullDetailedQuote('FR0000133308', 'XPAR');
    console.log(quote)
}

//main();

module.exports = {getDetailedQuote, DetailedQuote, getFullDetailedQuote, FullDetailedQuote};
