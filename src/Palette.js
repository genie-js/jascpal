import assign from 'object-assign'

// A JASC Paint Shop Pro Palette file.
//
// Usage:
// Palette(buf) where `buf` is a palette file source string or Buffer
// let pal = Palette(fs.readFileSync('palette.pal')) → a palette array parsed from source
// let pal = Palette([ [ r0, g0, b0 ], [ r1, g1, b1 ] ]) → a new palette array
// pal[0], pal.getColor(0) → the colour at the given index
// pal[0] = [ r, g, b ], pal.setColor(0, [ r, g, b ]) → set colour at an index
// pal.toString() → new palette file source string
//
// Palette file format:
// ```
// "JASC-PAL"
// 4 character version
// amount of lines
// palette lines: three space-separated numbers (0-255), "<red> <green> <blue>"
// ```
export default function Palette(buf) {
  if (!(this instanceof Palette)) return new Palette(buf)

  if (!buf) buf = []

  let data
  // creating a new palette
  if (Array.isArray(buf)) {
    data = { colors: buf, numColors: buf.length, version: '0100' }
  }
  // reading a palette
  else {
    let str = Buffer.isBuffer(buf) ? buf.toString('ascii') : buf
    data = parse(str)
  }

  // internal API
  assign(this, data)
  // public API
  data.colors.version = data.version
  Object.keys(Palette.prototype)
    .forEach(key => data.colors[key] = this[key].bind(this))

  return data.colors
}

function parse(buf) {
  let colors = []
    , lines = buf.split(/\r?\n/)

  // lines[0] == "JASC-PAL\n"
  let version = lines[1] // probably always 0100
  let numColors = parseInt(lines[2], 10)

  // TODO use lines.length instead of numColors, to be more forgiving?
  // maybe have a "loose" mode that will just do whatever is in the file
  // and a default stricter mode that also checks whether the file is valid
  for (let i = 3, l = numColors + 3; i < l; i++) {
    colors.push(lines[i].split(' ').map(x => parseInt(x, 10)))
  }

  return { version, numColors, colors }
}

Palette.prototype.getColor = function (idx) {
  return this.colors[idx]
}

Palette.prototype.setColor = function (idx, color) {
  this.colors[idx] = color
  return this
}

Palette.prototype.toString = function () {
  return 'JASC-PAL\n'
       + this.version + '\n'
       + this.colors.length + '\n'
       + this.colors.map(color => color.join(' ')).join('\n')
}