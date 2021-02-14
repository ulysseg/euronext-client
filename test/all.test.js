const expect = require('chai').expect
const client = require('../lib/index')

describe('Client Test', () => {

    // Another test with 'FR0000133308', 'XPAR'?

    describe('#getDetailedQuote()', () => {
        it('should get the detaild quote of Adyen', (done) => {
            const quotePromise = client.getDetailedQuote('NL0012969182', 'XAMS')
            quotePromise.then(q => {
                expect(q.instrumentName).to.equal('ADYEN');
                expect(q.instrumentPrice).to.be.greaterThan(0).and.be.finite;
                done();
            });
        });
    });

    describe('#getFullDetailedQuote()', () => {
        it('should get the full detaild quote of Adyen', (done) => {
            const quotePromise = client.getFullDetailedQuote('NL0012969182', 'XAMS')
            quotePromise.then(q => {
                expect(q._52weekLow).to.be.greaterThan(0).and.be.finite;
                expect(q._52weekHigh).to.be.greaterThan(0).and.be.finite;
                expect(q._52weekLow).to.be.lessThan(q._52weekHigh);
                done();
            });
        });
    });
 
});