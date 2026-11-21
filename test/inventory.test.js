const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

function product(stock, reserved) {
  return {id: 1, sku:'SPC-001', name:'Chilli', hsn:'0904', price:125, stock, reserved};
}
function line(qty) {
  return {id:1, sku:'SPC-001', name:'Chilli', hsn:'0904', price:125, qty};
}
test('last unit is sellable with and without wholesale holds', () => {
  for (const p of [product(1,0),product(4,3)]) {
    assert.equal(inventory.check([p],[line(1)]).ok,true);
    assert.equal(inventory.check([p],[line(2)]).ok,false);
  }
});
test('zero quantity at the inventory helper consumes no available units', () => {
  assert.equal(inventory.check([product(4,3)],[line(0)]).ok,true);
});
test('cancellation restores physical stock exactly once', () => {
  const p = product(8,3);
  const items = [line(2)];
  const db = {products:[p], orders:[{id:1007, status:'pending', items}]};
  inventory.reserve(db.products,items);
  assert.deepEqual([p.stock,p.reserved],[6,3]);
  assert.equal(orders.cancel(db,1007).ok,true);
  assert.deepEqual([p.stock,p.reserved],[8,3]); // after cancellation
  assert.equal(orders.cancel(db,1007).ok,false);
  assert.deepEqual([p.stock,p.reserved],[8,3]); // after retry
});

test('multiple cart lines can consume exactly the remaining stock but never oversell', () => {
  const p = product(5,3);
  assert.equal(inventory.check([p],[line(1),line(1)]).ok,true);
  assert.equal(inventory.check([p],[line(1),line(1),line(1)]).ok,false);
});
