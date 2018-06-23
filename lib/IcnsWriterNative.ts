import { IconWriter } from './IcnsWriter';
import * as Utils from './Utils';
import * as path from 'path';
import * as bplistCreator from 'bplist-creator';

const infoplist = [
    {
      "$version" : 100000,
      "$objects": [
        "$null", {
          "NS.keys": [2],
          "NS.objects": [3],
          "$class": 4
        },
        "name",
        "icon", {
          "$classname": "NSDictionary",
          "$classes": ["NSDictionary", "NSObject"]
        }],
        "$archiver" : "NSKeyedArchiver",
        "$top" : {
          "root": 1
        }

      }
  ];

class MetaIconEntry {
  public iconId?: string;
  public size?: number;
  public length?: number;

  constructor(iconId: string, size: number, length?: number) {
    this.iconId = iconId;
    this.size = size;
  }
}

let iconTypeMap = new Map([
  [ "32x32@2x",   new MetaIconEntry("ic12",64) ],
  [ "128x128",    new MetaIconEntry("ic07",128) ],
  [ "128x128@2x", new MetaIconEntry("ic13",256) ],
  [ "256x256",    new MetaIconEntry("ic08",256) ],
  [ "16x16",      new MetaIconEntry("ic04",16) ],
  [ "256x256@2x", new MetaIconEntry("ic14",512) ],
  [ "512x512",    new MetaIconEntry("ic09",512) ],
  [ "32x32",      new MetaIconEntry("ic05",32) ],
  [ "512x512@2x",  new MetaIconEntry("ic10",1024) ],
  [ "16x16@2x",   new MetaIconEntry("ic11",32) ],
]);

class IconEntry {
  private type?: string;
  private filePath?: string;
  private buffer?: Buffer;

  constructor(filePath: string) {
    this.filePath = filePath;

    let size =
      path
        .basename(filePath)
        .substr(0,filePath.length-4)
        .substr(5);

    size = size.substr(0,size.length - 4);

    this.type = iconTypeMap.get(size).iconId;
  }

  async init() {
      const buffer =
        await Utils.fs.readFile(this.filePath)
                        .catch(error => {});

      this.buffer = buffer;
  }

  write(): Buffer {
    let _buffer = Buffer.alloc(8);
    _buffer.write(this.type, 0, 4, 'ascii');
    _buffer.writeUInt32BE(this.buffer.length + 8, 4);

    return Buffer.concat([_buffer,this.buffer]);
  }
}

export class IconWriterNative extends IconWriter {
  constructor(pathToFolder:string, outputFile?: string) {
    super(pathToFolder,outputFile);
  }

  private writeInfo(): Buffer {
    const plistBuffer = bplistCreator(infoplist);
    let infoBuffer = Buffer.alloc(8);
    infoBuffer.write('info', 0, 4, 'ascii');
    infoBuffer.writeUInt32BE(plistBuffer.length + 8,4);
    return Buffer.concat([infoBuffer,plistBuffer]);
  }

  write(): Promise<void | Buffer> {

    return new Promise<void | Buffer>(async (resolve,reject) => {

      let buf = Buffer.alloc(8);
      let bytesWritten = 8;

      buf.write('icns');

      let allBuffers = new Array<Buffer>(buf);
      for (const type of iconTypeMap.keys()) {
        let entry = new IconEntry(this.pathToFolder + '/icon_' + type + '.png');
        await entry.init();
        const entryBuffer = entry.write();
        allBuffers.push(entryBuffer);
        bytesWritten += entryBuffer.length;
      }

      const infoBuffer = this.writeInfo();
      bytesWritten += infoBuffer.length;
      allBuffers.push(infoBuffer);

      buf.writeUInt32BE(bytesWritten, 4);
      const newBuffer = Buffer.concat(allBuffers);

      if (!this.useBuffer && this.outputFile) {
        await Utils.fs.writeFile(this.outputFile,newBuffer).catch(err => reject());
        resolve();
      } else {
        resolve(buf);
      }
    });
  }
}
