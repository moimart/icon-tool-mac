import { IconWriter } from './IcnsWriter';
import * as Utils from './Utils';

export class IconWriterNative extends IconWriter {
  constructor(pathToFolder:string, outputFile?: string) {
    super(pathToFolder,outputFile);
  }

  write(): Promise<void | Buffer> {

    return new Promise<void>((resolve,reject) => {
      if (!this.useBuffer) {
        resolve();
      } else {
        reject();
      }
    });
  }
}
