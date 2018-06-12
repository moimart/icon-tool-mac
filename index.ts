import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as jimp from 'jimp';
import * as rimraf from 'rimraf';

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

    return new Promise<string>((resolve,reject) => {
      fs.exists(realFile, (test:boolean) => {
        if (!test) {
          return reject('file not found');
        }

        try {
          jimp.read(realFile)
          .then((res:Jimp.Jimp) => {
            if (res.bitmap.width != res.bitmap.height) {
              return reject('width resolution must equal as height.');
            }

            if (res.bitmap.width < 128) {
              return reject('file resolution is too small; minimum 128x128; recommended 1024x1024.');
            }

            let tmpPath = '/tmp/' + this.random() + '.iconset';

            this.createTmpFiles(tmpPath,res);

            setTimeout(()=>{
              this.createIcns(tmpPath,resolve,reject);
            },500);
          })
          .catch(err => reject(err));
        } catch(exception) {
          reject('wrong file format');
        }
      });
    });
  }

  private createIcns(tmpPath:string, resolve:any, reject:any) {
    let cmd = `/usr/bin/iconutil -c icns --output "${this.output}" "${tmpPath}"`;

    exec(cmd, (err,stdout,stderr) => {

      if (stderr) {
        return reject(stderr + cmd);
      }

      rimraf(tmpPath,()=>{});
      resolve(this.output);
    });
  }

  private async createTmpFiles(tmpPath:string, image:Jimp.Jimp) {
    if (!fs.existsSync(tmpPath)){
      fs.mkdirSync(tmpPath);
    }

    let descriptors = IconDescriptor.createDescriptors();

    for (let desc of descriptors) {
      let file = path.join(tmpPath,`icon_${desc.tag}.png`);

      await image
      .resize(desc.size,desc.size)
      .write(file);
    }
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
