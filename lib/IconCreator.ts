import * as path from 'path';
import { promisfyNoError } from 'promisfy';
import * as Utils from './Utils';
import * as Icns from './IcnsWriter';
import { IconWriterNative } from './IcnsWriterNative';

export class IconDescriptor {
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

export abstract class IconCreator {
  protected file?: string;

  constructor(file: string, output?: string) {
    this.file = file;
  }

  public abstract convert(): Promise<string | Buffer>;
}
