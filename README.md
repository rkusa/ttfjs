# ttfjs

TTFjs is a TrueType font parser entirely written in JavaScript and compatible to both Node.js and the Browser.

[![NPM][npm]](https://npmjs.org/package/ttfjs)
[![Dependency Status][deps]](https://david-dm.org/rkusa/ttfjs)

### Specification Coverage

The following tables are implemented: **cmap** (currently only format 4), **glyf** (glyphs are not actually decomposed, only rewritten), **head**, **hhea**, **hmtx**, **loca**, **maxp**, **name**, **os2**, **post** (currently only format 3).

**TrueType Font Specification:** [Apple](https://developer.apple.com/fonts/TTRefMan/RM06/Chap6.html), [Microsoft](http://www.microsoft.com/typography/specs/default.htm)

## Usage

Coming soon ...

## MIT License
Copyright (c) 2013-2015 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: http://img.shields.io/npm/v/ttfjs.svg?style=flat
[deps]: http://img.shields.io/david/rkusa/ttfjs.svg?style=flat