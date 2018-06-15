import * as _fs from 'fs';

import { promisfy, promisfyNoError } from 'promisfy';

export var fs = {
  readFile : promisfy(_fs.readFile),
  exists: promisfyNoError(_fs.exists),
  mkdir: promisfy(_fs.mkdir)
};
