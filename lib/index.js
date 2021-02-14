'use strict';

const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');

// Full URL example https://live.euronext.com/en/ajax/getDetailedQuote/FR0000133308-XPAR
// Actual website calls this URL repeatedly to display live price. FI, using http redirect (302) to https.
const EURONEXT_URL = 'https://live.euronext.com/en/ajax/getDetailedQuote/';
const EURONEXT_FULL_QUOTE_URL = 'https://live.euronext.com/en/intraday_chart/getDetailedQuoteAjax/';
const USER_AGENT = 'Mozilla/5.0';


/**
 * Get the detailed quote of the instrument.
 * 
 * @param {string} isin ISIN of the instrument (for example FR0000133308)
 * @param {string} market Market code of the instrument (for example XPAR)
 * @returns {Promise<DetailedQuote>} The detailed quote
 */
async function getDetailedQuote(isin, market) {
    const url = new URL(`${isin}-${market}`, EURONEXT_URL);
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            // 24/05/2020 update: does not seem necessary anymore. Still present in case 
            // it becomes necessary again
            'User-Agent': USER_AGENT,
            // 'Origin': 'https://live.euronext.com',
            // Without it, reply is empty
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
     },
        body: 'theme_name=euronext_live'
    });
    const html = await response.text();
    const root = HTMLParser.parse(html);
    const instrumentName = root.querySelector('#header-instrument-name').text.trim();
    const price = parseEuronextNumber(root.querySelector('#header-instrument-price').innerHTML);
    return new DetailedQuote(instrumentName, price);
}

/**
 * Get the full detailed quote of the instrument.
 * 
 * @param {string} isin ISIN of the instrument (for example FR0000133308)
 * @param {string} market Market code of the instrument (for example XPAR)
 * @returns {Promise<FullDetailedQuote>} The full detailed quote
 */
// https://live.euronext.com/en/intraday_chart/getDetailedQuoteAjax/FR0000133308-XPAR/full
async function getFullDetailedQuote(isin, market) {
    const url = new URL(`${isin}-${market}/full`, EURONEXT_FULL_QUOTE_URL);
    const response = await fetch(url, {
        method: 'GET', // GET this time
        headers: { 
            // 24/05/2020 update: does not seem necessary anymore. Still present in case 
            // it becomes necessary again
            'User-Agent': USER_AGENT,
     }
    });
    const html = await response.text();
    const root = HTMLParser.parse(html);
    // Find the 52 week tr element
    const tds = root.querySelectorAll('td');
    let _52weekLow, _52weekHigh;
    for (let i = 0; i < tds.length; i++) {
        const td = tds[i];
        if (td.text === '52 Week') {
            const tokens = tds[i+1].text.trim().split(/\s+/);
            // Thousands are comma-separated like this 1,000
            _52weekLow = parseEuronextNumber(tokens[0]);
            _52weekHigh = parseEuronextNumber(tokens[1]);
            break;
        }
    }
    // TODO when not found
    return new FullDetailedQuote(_52weekLow, _52weekHigh);
}

function parseEuronextNumber(s) {
    return Number(s.replace(/,/g, ''));
}

class DetailedQuote {
    constructor(instrumentName, instrumentPrice) {
        this.instrumentName = instrumentName;
        this.instrumentPrice = checkIsNumber(instrumentPrice);
    }
}

class FullDetailedQuote {
    constructor(_52weekLow, _52weekHigh) {
        this._52weekLow = checkIsNumber(_52weekLow);
        this._52weekHigh = checkIsNumber(_52weekHigh);
    }
}

// Maybe a better way to do this? A library?
function checkIsNumber(n) {
    if (Number.isNaN(n) || typeof(n) !== 'number') {
        throw new Error(`${n} is not a number`);
    }
    return n;
}

module.exports = {getDetailedQuote, DetailedQuote, getFullDetailedQuote, FullDetailedQuote};
