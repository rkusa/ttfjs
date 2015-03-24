# ttfjs

TTFjs is a TrueType font parser entirely written in JavaScript and compatible to both Node.js and the Browser.

[![NPM][npm]](https://npmjs.org/package/ttfjs)
[![Dependency Status][deps]](https://david-dm.org/rkusa/ttfjs)

### Specification Coverage

The following tables are implemented: **cmap** (currently only format 4), **glyf** (glyphs are not actually decomposed, only rewritten), **head**, **hhea**, **hmtx**, **loca**, **maxp**, **name**, **os2**, **post** (currently only format 3).

**TrueType Font Specification:** [Apple](https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html), [Microsoft](http://www.microsoft.com/typography/specs/default.htm)

## Usage

```js
var TTFFont = require('ttfjs')
```

### new TTFFont(buffer)

Create a new font instance from the provided buffer (can be a Node `Buffer` or an `ArrayBuffer`).

#### .stringWidth(str, size)

Returns the width for the given string in the given font size.

#### .lineHeight(size, [includeGap])

Returns the line height for the given font size with line gap or without.

#### .lineDescent(size)

Return the line descent for the given font size.

#### .clone()

Returns a clone of the font object.

#### .save()

Encodes the font into an `ArrayBuffer`.

#### .subset([opts])

Creates a `Subset` for the current font.

### .subset([opts]) | new TTFFont.Subset(font, [opts])

Creates a `Subset` for the current font.

**Options:**

- **remap** - (default: true) whether to remap char codes
- **trimNames** - (default: false) whether trim localized names (reduces file size)

#### .use(chars)

Add the given characters to the subset.

#### .encode(str)

Encode the given string using the current remapping.

#### .embed()

Embed the current used characters.

#### .save()

Encodes the subset into an `ArrayBuffer`.

## Example

```js
var fs = require('fs')
var TTFFont = require('ttfjs')

var font = new TTFFont(fs.readFileSync(__dirname + '/Corbel.ttf'))
var subset = font.subset()

subset.use('abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890')
console.log(subset.encode('abcdefghijklmnopqrstuvwxyz'))

subset.embed()

fs.writeFileSync('./test.ttf', toBuffer(subset.save()), { encoding: 'binary' })

function toBuffer(ab) {
  var buffer = new Buffer(ab.byteLength)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i]
  }
  return buffer
}
```


## MIT License
Copyright (c) 2013-2015 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: http://img.shields.io/npm/v/ttfjs.svg?style=flat
[deps]: http://img.shields.io/david/rkusa/ttfjs.svg?style=flat