icon-tool-mac
======

TypeScript tool to create .icns with macOS icontool

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
import { IconCreator } from 'icon-tool-mac';

let creator = new IconCreator(source_png);

creator.convert()
.then((icon: Buffer) => {
  // .. do something with the .icns buffer
})
.catch((error: string) => console.error(error));
```

# JavaScript

```
const IconCreator = require('icon-tool-mac').IconCreator;

let creator = new IconCreator(source_png);

creator.convert()
.then((icon) => {
  // .. do something with the .icns buffer
})
.catch(error => console.error(error));
```
