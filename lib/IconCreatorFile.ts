import { IconDescriptor, IconCreator } from './IconCreator';
import * as path from 'path';
import * as Utils from './Utils';
import * as Icns from './IcnsWriter';
import * as jimp from 'jimp';
import { IconWriterNative } from './IcnsWriterNative';
import { promisfyNoError, promisfy } from 'promisfy';
import Jimp = require('jimp');

export class IconCreatorFile extends IconCreator {
  private output?: string;
  private useBuffer: boolean = false;
  private cli: boolean = false;

  constructor(file: string, output?: string) {
    super(file,output);

    if (output) {
      this.output = path.resolve(output);
    } else {
      this.output = '/tmp/tmpIcon' + this.random() + '.icns';
      this.useBuffer = true;
    }
  }

  public useCLI(cli:boolean) {
    this.cli = cli;
  }

  private random(): string {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  public convert(): Promise<string | Buffer> {
    let realFile = path.resolve(this.file)

    return new Promise<string>(async (resolve,reject) => {

      if (await Utils.fs.exists(realFile)) {
        try {
          const res = await jimp.read(realFile);

          if (res.bitmap.width != res.bitmap.height) {
            return reject('width resolution must equal as height.');
          }

          if (res.bitmap.width < 128) {
            return reject('file resolution is too small; minimum 128x128; recommended 1024x1024.');
          }

          let tmpPath = '/tmp/' + this.random() + '.iconset';

          await this.createTmpFiles(tmpPath,res);
          this.createIcns(tmpPath,resolve,reject);

        } catch (exception) {
          throw 'Error when processing the image ' + exception;
        }

      } else {
        throw 'File not found';
      }

    });
  }

  private async createIcns(tmpPath:string, resolve, reject) {
    let writer:Icns.IconWriter = null;

    if (this.cli) {
      writer = new Icns.IconWriterCLI(tmpPath,this.output);
    } else {
      writer = new IconWriterNative(tmpPath,this.output);
    }

    const res = await writer.write().catch(error => reject(error));

    if (res instanceof Buffer) {
      resolve(res);
    } else {
      resolve(this.output);
    }
  }

  private async createTmpFiles(tmpPath:string, image:Jimp): Promise<void> {

    let descriptors = IconDescriptor.createDescriptors();

    return new Promise<void>(async (resolve,reject) => {

      if (!await Utils.fs.exists(tmpPath)) {
        await Utils.fs.mkdir(tmpPath).catch(error => reject());
      }

      let promises = new Array<any>();
      for (let desc of descriptors) {
        const file = path.join(tmpPath,`icon_${desc.tag}.png`);
        const scaledImage = image.clone().resize(desc.size,desc.size);
        const write = promisfyNoError(scaledImage.write,scaledImage);
        promises.push(write(file));
      }

      await Promise.all(promises);

      resolve();
    });
  }
}
