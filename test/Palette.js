var Palette = require('../lib/Palette')
  , assert = require('assert')
  , readFile = require('fs').readFileSync
  , joinPath = require('path').join

function read(file) { return readFile(joinPath(__dirname, file)) }

describe('Palette:', function () {

  describe('parses valid palettes', function () {
    var pal = Palette(read('simple.pal'))

    it('does not choke immediately (nice to have!)', function () {
      assert.strictEqual(pal.length, 8)
      assert.strictEqual(pal.version, '0100')
    })

    it('doesn\'t mind empty palettes', function () {
      var empty = Palette(read('empty.pal'))
      assert.strictEqual(empty.length, 0)
      assert.strictEqual(empty.version, '0100')
      assert.strictEqual(empty[0], undefined)
    })

    it('supports array access + getColor method', function () {
      assert.deepEqual(pal[0], [ 0x00, 0x00, 0x00 ])
      assert.deepEqual(pal[3], [ 0x00, 0xff, 0xff ])

      assert.strictEqual(pal[0], pal.getColor(0))
    })

    it('can change', function () {
      var pal = Palette(read('simple.pal'))
      assert.deepEqual(pal[1], [ 0x00, 0x00, 0xff ])
      assert.deepEqual(pal[2], [ 0x00, 0xff, 0x00 ])

      pal[1] = [ 0x77, 0x77, 0x77 ]
      pal.setColor(2, [ 0x88, 0x88, 0x88 ])

      assert.deepEqual(pal[1], [ 0x77, 0x77, 0x77 ])
      assert.deepEqual(pal[2], [ 0x88, 0x88, 0x88 ])

      assert.strictEqual(pal.toString(), read('expected-simple.pal').toString('ascii'))
    })

    it('supports carriage returns', function () {
      var empty = Palette('JASC-PAL\r\n0100\r\n0\r\n')

      assert.notEqual(empty.version, '0100\r')
      assert.strictEqual(empty.version, '0100')
    })
  })

  describe('creates new palettes', function () {
    it('from color arrays', function () {
      var pal = Palette([ [ 0,  0,   128 ]
                        , [ 0,  128, 128 ]
                        , [ 71, 47,  63  ]
                        , [ 1,  2,   3   ]
                        , [ 4,  65,  6   ] ])
      assert.strictEqual(pal.toString(), read('expected-create.pal').toString('ascii'))
    })
    it('out of thin air', function () {
      var pal = Palette()
      pal.push([ 0, 0, 128 ]) // array methods!
      pal[1] = [ 0, 128, 128 ] // assigning array indices!
      pal.setColor(2, [ 71, 47, 63 ]) // Palette methods!
      pal.push([ 1, 2, 3 ]
             , [ 4, 65, 6 ]) // more array methods!
      assert.strictEqual(pal.toString(), read('expected-create.pal').toString('ascii'))
    })
  })

})