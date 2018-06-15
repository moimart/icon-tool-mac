import { exec } from 'child_process';
import * as path from 'path';
import * as Utils from './Utils';
import * as rimraf from 'rimraf';

export abstract class IconWriter {
  protected pathToFolder?: string;
  protected outputFile: string = "";
  protected useBuffer: boolean = false;

  constructor(pathToFolder:string, outputFile?: string) {
    this.pathToFolder = pathToFolder;

    if (outputFile) {
      this.outputFile = outputFile;
    } else {
      this.useBuffer = true;
    }
  }

  abstract write(): Promise<void | Buffer>;
}

export class IconWriterCLI extends IconWriter {
  constructor(pathToFolder:string, outputFile?: string) {
    super(pathToFolder,outputFile);
  }

  write(): Promise<void | Buffer> {

    return new Promise<void>((resolve,reject) => {
      let cmd = `/usr/bin/iconutil -c icns --output ${this.outputFile} ${this.pathToFolder}`;

      exec(cmd, (err,stdout,stderr) => {

        if (stderr) {
          reject(`${stderr} ${cmd}`);
        }

        if (!this.useBuffer) {
          rimraf(this.pathToFolder,()=>{});
          resolve();
        } else {
          const res = Utils.fs.readFile(this.outputFile).catch(error => reject(error));
          resolve(res);
        }
      });
    });
  }
}
