import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as jimp from 'jimp';
import * as rimraf from 'rimraf';
import { promisfyNoError } from 'promisfy';

class IconDescriptor {
  public size: number = 0;
  public tag: string = "";

  constructor(size: number, tag: string) {
    this.size = size;
    this.tag = tag;
  }

  public static createDescriptors(): Array<IconDescriptor> {
    let descs: Array<IconDescriptor> = new Array<IconDescriptor>();

    for (let i = 16; i <= 512; i *= 2) {
      descs.push(new IconDescriptor(i,`${i}x${i}`));

      if (i != 16) {
        descs.push(new IconDescriptor(i,`${i/2}x${i/2}@2x`));
      }
    }

    descs.push(new IconDescriptor(1024,"512x512@2x"));

    return descs;
  }
}

class CreateIcon {
  private file?: string;
  private output?: string;

  constructor(file: string, output: string) {
    this.file = file;
    this.output = path.resolve(output);
  }

  private random(): string {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  public convert(): Promise<string> {
    let realFile = path.resolve(this.file)

    return new Promise<string>(async (resolve,reject) => {

      if (fs.existsSync(realFile)) {
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
          reject('Error when processing the image ' + exception);
        }

      } else {
        reject('File not found');
      }

    });
  }

  private createIcns(tmpPath:string, resolve, reject) {
    let cmd = `/usr/bin/iconutil -c icns --output "${this.output}" "${tmpPath}"`;

    exec(cmd, (err,stdout,stderr) => {

      if (stderr) {
        return reject(stderr + cmd);
      }

      rimraf(tmpPath,()=>{});
      resolve(this.output);
    });
  }

  private createTmpFiles(tmpPath:string, image:Jimp.Jimp): Promise<void> {
    if (!fs.existsSync(tmpPath)){
      fs.mkdirSync(tmpPath);
    }

    let descriptors = IconDescriptor.createDescriptors();

    return new Promise<void>(async (resolve,reject) => {
      for (let desc of descriptors) {
        let file = path.join(tmpPath,`icon_${desc.tag}.png`);

        const scaledImage = image.clone().resize(desc.size,desc.size);
        const write = promisfyNoError(scaledImage.write,scaledImage);

        await write(file);
      }

      resolve();
    });
  }
}

if (process.argv.length < 3) {
  console.error('Please specify a file');
} else {
  let output = "icon.icns";

  if (process.argv.length <= 4) {
    output = process.argv[3] + ".icns";
  }

  let converter = new CreateIcon(process.argv[2],output);

  converter.convert()
  .then((icon: string) => {
    console.log(`${icon}`);
  })
  .catch((error: string) => {
    console.error(error);
  });
}
