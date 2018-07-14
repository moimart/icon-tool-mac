import { IconDescriptor, IconCreator } from './IconCreator';
import * as path from 'path';
import * as sharp from 'sharp';
import { promisfyNoError, promisfy } from 'promisfy';
import * as Utils from './Utils';
import * as Icns from './IcnsWriter';
import { IconWriterNative } from './IcnsWriterNative';
import { ImageRLE } from './ImageRLE';

export class IconCreatorSharp extends IconCreator {
  private useBuffer: boolean = false;
  private buffers: Map<string,Buffer> = new Map<string,Buffer>();
  private output?: string;

  constructor(file: string | Buffer, output?: string) {
    super(file,output);

    if (output) {
      this.output = path.resolve(output);
    } else {
      this.useBuffer = true;
    }
  }

  public convert(): Promise<string | Buffer> {
    return new Promise<string>(async (resolve,reject) => {
      let realFile = path.resolve(this.file)

      if (await Utils.fs.exists(realFile) || this.buffer != null) {
        try {

          let image = null;

          if (this.buffer != null) {
            image = sharp(this.buffer,{ density: 500 });
          } else {
            image = sharp(realFile,{ density: 500 });
          }

          const metadata:sharp.Metadata = await image.metadata().catch(err => reject(err)) as sharp.Metadata;

          if (metadata.format !== "svg") {
            if (metadata.width != metadata.height) {
              return reject('width resolution must equal as height.');
            }

            if (metadata.width < 128) {
              return reject('file resolution is too small; minimum 128x128; recommended 1024x1024.');
            }
          }

          await this.createBuffers(image);
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

  private swapChannels(data:Buffer): Buffer {
    for (let i = 0; i < data.length; i += 4) {

      let tmp0 = data[i];
      let tmp1 = data[i+1];
      let tmp2 = data[i+2];
      let tmp3 = data[i+3];

      data[i] = tmp3; //A
      data[i+1] = tmp0; //R
      data[i+2] = tmp1; //G
      data[i+3] = tmp2; //B
    }

    return data;
  }

  private async createBuffers(image:sharp.SharpInstance) {

    let descriptors = IconDescriptor.createDescriptors();

    let promises = new Array<any>();
    for (let desc of descriptors) {
      const scaledImage = image.clone().resize(desc.size,desc.size);
      if (desc.tag == "16x16" || desc.tag === "16x16@2x") {
        let buffer = await scaledImage.raw().toBuffer().catch(() => {}) as Buffer;
        this.buffers.set(desc.tag,ImageRLE.encodeRLE(this.swapChannels(buffer)));
      } else {
        let buffer = await scaledImage.png().toBuffer().catch(() => {}) as Buffer;
        this.buffers.set(desc.tag,buffer);
      }

    }
  }
}
