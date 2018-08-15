icon-tool-mac
======

TypeScript tool to create .icns with a built-in icns generator or the macOS icontool

Supports PNG, SVG and many formats for input. outputs icns files with PNG and RLE-encoded image formats

# Building and running

`$ yarn install`

`$ yarn build`

`$ bin/make-icns iconfile.png [output-name]`

# Installing

`$ yarn add --global icon-tool-mac`

or

`$ npm install -g icon-tool-mac`

# Usage when installed globally

`$ make-icns iconfile.png [output-name]`

# Installing and using as a library

`$ yarn add icon-tool-mac`

or

`$ npm i icon-tool-mac`

# TypeScript

```
import { IconCreatorSharp } from 'icon-tool-mac';

let creator = new IconCreatorSharp(source_file);

creator.convert()
.then((icon: Buffer) => {
  // .. do something with the .icns buffer
})
.catch((error: string) => console.error(error));
```
If you want to do additional image manipulations before creating the .icns:

```
//Additional import
import { SharpInstance } from 'sharp';

creator.setImageManipulation((image:SharpInstance,size:number) => {
  image.flop(true);
});
```

# JavaScript

```
const IconCreatorSharp = require('icon-tool-mac').IconCreatorSharp;

let creator = new IconCreator(source_file);

creator.convert()
.then((icon) => {
  // .. do something with the .icns buffer
})
.catch(error => console.error(error));
```

# Alternative Implementations

Check the /lib/ folder to find other implementations relying on the icontool generator provided by macOS
