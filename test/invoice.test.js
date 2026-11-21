const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(hsn, price, qty) {
  return { hsn, price, qty, name: 'Fixture ' + hsn, sku: hsn };
}

// Values are [subtotal, discount, GST, total] in rupees.
const cases = [
  ['mixed HSN slabs', [item('0713', 100, 1), item('0405', 100, 1)], '', [200,0,17,217]],
  ['#1002 SAVE10', [item('1006', 640, 1), item('1512', 190, 2)], 'SAVE10', [1020,102,45.9,963.9]],
  ['#1004 capped SAVE10', [item('1508', 1120, 2)], 'SAVE10', [2240,150,104.5,2194.5]],
  ['#1008 all 18%', [item('0902', 140, 1), item('2106', 180, 2)], '', [500,0,90,590]]
];

function figures(result) {
  return [result.subtotal, result.discount, result.tax, result.total];
}
for (const [name, items, coupon, billed] of cases) {
  test(name + ' invoice agrees with checkout', () => {
    assert.deepEqual(figures(pricing.computeTotals(items, coupon)), billed);
    assert.deepEqual(figures(invoice.computeInvoiceFigures({items, coupon})), billed);
  });
}

test('invoice includes the checkout line taxes, including explicit zero and fractional rates', () => {
  const items = [{...item('0902', 500, 1), gstRate:0}, {...item('0713', 200, 2), gstRate:0.12}];
  const actual = invoice.computeInvoiceFigures({items, coupon:'SAVE10'});
  assert.deepEqual(actual.rows.map(r=>[r.gstPercent,r.lineTax]), [[0,0],[12,43.2]]);
  assert.deepEqual([actual.discount,actual.cgst,actual.sgst,actual.total], [90,21.6,21.6,853.2]);
});
