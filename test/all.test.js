const expect = require('chai').expect
const client = require('../lib/index')

describe('Client Test', function() {

    describe('#getDetailedQuote()', function() {
        it('should get the detaild quote of Adyen', async function() {
            const quote = await client.getDetailedQuote('NL0012969182', 'XAMS');
            expect(quote.instrumentName).to.equal('ADYEN');
            expect(quote.instrumentPrice).to.be.greaterThan(0).and.be.finite;
        });
    });

    describe('#getFullDetailedQuote()', function() {
        it('should get the full detaild quote of Adyen', async function() {
            const quote = await client.getFullDetailedQuote('NL0012969182', 'XAMS');
            expect(quote._52weekLow).to.be.greaterThan(0).and.be.finite;
            expect(quote._52weekHigh).to.be.greaterThan(0).and.be.finite;
            expect(quote._52weekLow).to.be.lessThan(quote._52weekHigh);
        });
    });    

    // Another test with 'FR0000133308', 'XPAR'?
 
});