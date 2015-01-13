// tiny helper, for lack of Object.assign!
let merge = (base, mixin) => {
  Object.keys(mixin).forEach(key => base[key] = mixin[key])
  return base
}

/**
 * A JASC Paint Shop Pro Palette file.
 *
 * @param {string|Buffer} buf Palette file source.
 * @constructor
 */
export default function Palette(buf) {
  if (!(this instanceof Palette)) return new Palette(buf)

  if (!buf) buf = []

  let data
  if (Array.isArray(buf)) {
    data = { colors: buf, numColors: buf.length, version: '0100' }
  }
  else {
    let str = Buffer.isBuffer(buf) ? buf.toString('ascii') : buf
    // parse
    data = parse(str)
  }

  // internal API
  merge(this, data)
  // public API
  data.colors.version = data.version
  Object.keys(Palette.prototype)
    .forEach(key => data.colors[key] = this[key].bind(this))

  return data.colors
}

/**
 * Parses a palette file.
 * Format:
 * ```
 * "JASC-PAL"
 * 4 character version
 * amount of lines
 * palette lines: three space-separated numbers (0-255), "<red> <green> <blue>"
 * ```
 */
function parse(buf) {
  let colors = []
    , lines = buf.split('\n')

  // lines[0] == "JASC-PAL\n"
  let version = lines[1] // probably always 0100
  let numColors = parseInt(lines[2], 10)

  for (let i = 3, l = numColors + 3; i < l; i++) {
    colors.push(lines[i].split(' ').map(x => parseInt(x, 10)))
  }

  return { version, numColors, colors }
}

/**
 * Returns the colour at a given index in the palette.
 * @param {number} idx Colour index in the palette.
 * @return {Array.<number>|undefined} [r, g, b] colour array, or undefined if the index doesn't exist.
 */
Palette.prototype.getColor = function (idx) { return this.colors[idx] }

/**
 * Sets the colour at a given index in the palette.
 * @param {number} idx Colour index in the palette.
 * @param {Array.<number>} color [r, g, b] colour array.
 * @return {Palette} This.
 */
Palette.prototype.setColor = function (idx, color) {
  this.colors[idx] = color
  return this
}

/**
 * Returns up-to-date Palette file source.
 * @return {string} Palette file source.
 */
Palette.prototype.toString = function () {
  return 'JASC-PAL\n'
       + this.version + '\n'
       + this.colors.length + '\n'
       + this.colors.map(color => color.join(' ')).join('\n')
}