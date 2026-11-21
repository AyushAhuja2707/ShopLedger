const test = require('node:test');
const assert = require('node:assert/strict');
const orders = require('../lib/orders');
const dates = require('../lib/dates');
const ledger = require('../lib/ledger');

const history = { orders: ['15/03/2022','30/01/2022','28/12/2021'].map(date => ({date})) };
function list(filters) {
  return orders.list(history, filters).map(order => order.date);
}
function account() {
  return {customers: [{id: 1, totalBilled: 2432.01, totalSettled: 1200}], settlements: [], nextSettlementId: 10};
}
test('history sorts newest first across years', () => {
  assert.deepEqual(list(), ['15/03/2022','30/01/2022','28/12/2021']);
});
test('ISO date range includes January only', () => {
  assert.deepEqual(list({from:'2022-01-01',to:'2022-01-31'}), ['30/01/2022']);
});
test('both date formats normalize to an ISO key', () => {
  for (const date of ['2022-03-15','15/03/2022']) assert.equal(dates.normalizeDateKey(date),'2022-03-15');
});
test('numeric payment lowers the balance and records a settlement', () => {
  const db = account();
  assert.equal(ledger.recordSettlement(db,1,500).customer.balance,732.01);
  assert.equal(db.settlements[0].amount,500);
});
test('string payment credits the same amount as cash', () => {
  const {customer} = ledger.recordSettlement(account(),1,'500');
  assert.equal(customer.totalSettled,1700);
  assert.equal(customer.balance,732.01);
});
test('zero and negative amounts leave the account untouched', () => {
  for (const amount of [0,-1]) {
    const db = account();
    assert.equal(ledger.recordSettlement(db,1,amount).ok,false);
    assert.deepEqual(db,account());
  }
});
test('nonnumeric text is rejected', () => {
  assert.equal(ledger.recordSettlement(account(),1,'bad').ok,false);
});

test('January filter selects chronological history and monetary input is validated before mutation', () => {
  assert.deepEqual(list({from:'2022-01-30',to:'2022-01-30'}),['30/01/2022']);
  assert.deepEqual(list({from:'2022-02-01'}),['15/03/2022']);
  assert.deepEqual(list({to:'2021-12-31'}),['28/12/2021']);
  for (const amount of [true, [], {}, ' ', 'NaN', Infinity]) {
    const db = account();
    assert.equal(ledger.recordSettlement(db,1,amount).ok,false);
    assert.deepEqual(db,account());
  }
  for (const date of ['2022-03-31','31/03/2022']) assert.equal(dates.getFiscalYear(date),'FY21-22');
  assert.equal(dates.getFiscalYear('01/04/2022'),'FY22-23');
});
