import { IconDescriptor, IconCreator } from './IconCreator';
import * as path from 'path';
import * as jimp from 'jimp';
import { promisfyNoError, promisfy } from 'promisfy';
import * as Utils from './Utils';
import * as Icns from './IcnsWriter';
import { IconWriterNative } from './IcnsWriterNative';
import Jimp = require('jimp');

export class IconCreatorMemory extends IconCreator { 
  private useBuffer: boolean = false;
  private buffers: Map<string,Buffer> = new Map<string,Buffer>();
  private output?: string;

  constructor(file: string, output?: string) {
    super(file,output);

    if (output) {
      this.output = path.resolve(output);
    } else {
      this.useBuffer = true;
    }
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

          await this.createBuffers(res);
          this.createIcns(resolve,reject);

        } catch (exception) {
          throw 'Error when processing the image ' + exception;
        }

      } else {
        throw 'File not found';
      }

    });
  }

  private async createIcns(resolve, reject) {
    let writer = new IconWriterNative(this.buffers,this.output);

    const res = await writer.write().catch(error => reject(error));

    if (res instanceof Buffer) {
      resolve(res);
    } else {
      resolve(this.output);
    }
  }

  private async createBuffers(image:Jimp) {

    let descriptors = IconDescriptor.createDescriptors();

    let promises = new Array<any>();
    for (let desc of descriptors) {
      const scaledImage = image.clone().resize(desc.size,desc.size);
      let getBuffer = promisfy(scaledImage.getBuffer,scaledImage);
      let buffer = await getBuffer('image/png').catch((err)=> console.log(err));
      this.buffers.set(desc.tag,buffer);
    }
  }
}
