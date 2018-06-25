import { exec } from 'child_process';
import * as path from 'path';
import * as Utils from './Utils';
import * as rimraf from 'rimraf';

export abstract class IconWriter {
  protected imagesLocation?: string | Map<string,Buffer>;
  protected outputFile: string = "";
  protected useBuffer: boolean = false;

  constructor(imagesLocation:string | Map<string,Buffer>, outputFile?: string) {
    this.imagesLocation = imagesLocation as string;

    if (outputFile) {
      this.outputFile = outputFile;
    } else {
      this.useBuffer = true;
    }
  }

  abstract write(): Promise<void | Buffer>;
}

export class IconWriterCLI extends IconWriter {
  constructor(imagesLocation:string, outputFile?: string) {
    super(imagesLocation,outputFile);
  }

  write(): Promise<void | Buffer> {

    return new Promise<void>((resolve,reject) => {
      let cmd = `/usr/bin/iconutil -c icns --output ${this.outputFile} ${this.imagesLocation}`;

      exec(cmd, (err,stdout,stderr) => {

        if (stderr) {
          reject(`${stderr} ${cmd}`);
        }

        if (!this.useBuffer) {
          rimraf(this.imagesLocation as string,()=>{});
          resolve();
        } else {
          const res = Utils.fs.readFile(this.outputFile).catch(error => reject(error));
          resolve(res);
        }
      });
    });
  }
}
