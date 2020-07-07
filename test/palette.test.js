var test = require('tap').test
var Palette = require('../')
var readFile = require('fs').readFileSync
var joinPath = require('path').join

function read (file) {
  return readFile(joinPath(__dirname, file))
}

test('parse - does not choke immediately', function (t) {
  var pal = Palette(read('simple.pal'))

  t.strictEqual(pal.length, 8)
  t.strictEqual(pal.version, '0100')
  t.end()
})

test('parse - doesn\'t mind empty palettes', function (t) {
  var empty = Palette(read('empty.pal'))
  t.strictEqual(empty.length, 0)
  t.strictEqual(empty.version, '0100')
  t.strictEqual(empty[0], undefined)
  t.end()
})

test('parse - supports array access + getColor method', function (t) {
  var pal = Palette(read('simple.pal'))

  t.deepEqual(pal[0], [0x00, 0x00, 0x00])
  t.deepEqual(pal[3], [0x00, 0xff, 0xff])

  t.strictEqual(pal[0], pal.getColor(0))
  t.end()
})

test('parse - can change', function (t) {
  var pal = Palette(read('simple.pal'))
  t.deepEqual(pal[1], [0x00, 0x00, 0xff])
  t.deepEqual(pal[2], [0x00, 0xff, 0x00])

  pal[1] = [0x77, 0x77, 0x77]
  pal.setColor(2, [0x88, 0x88, 0x88])

  t.deepEqual(pal[1], [0x77, 0x77, 0x77])
  t.deepEqual(pal[2], [0x88, 0x88, 0x88])

  t.strictEqual(pal.toString(), read('expected-simple.pal').toString('ascii'))
  t.end()
})

test('parse - supports carriage returns', function (t) {
  var empty = Palette('JASC-PAL\r\n0100\r\n0\r\n')

  t.notEqual(empty.version, '0100\r')
  t.strictEqual(empty.version, '0100')
  t.end()
})

test('new - from color arrays', function (t) {
  var pal = Palette([[0, 0, 128],
    [0, 128, 128],
    [71, 47, 63],
    [1, 2, 3],
    [4, 65, 6]])
  t.strictEqual(pal.toString(), read('expected-create.pal').toString('ascii'))
  t.end()
})

test('new - out of thin air', function (t) {
  var pal = Palette()
  pal.push([0, 0, 128]) // array methods!
  pal[1] = [0, 128, 128] // assigning array indices!
  pal.setColor(2, [71, 47, 63]) // Palette methods!
  pal.push([1, 2, 3]
    , [4, 65, 6]) // more array methods!
  t.strictEqual(pal.toString(), read('expected-create.pal').toString('ascii'))
  t.end()
})
