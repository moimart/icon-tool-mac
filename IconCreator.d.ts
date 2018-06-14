declare interface IconCreator {

  constructor(file: string, output: string, toBuffer?: boolean);

  public convert(): Promise<string | Buffer>;
}

export = IconCreator;
