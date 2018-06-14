declare interface IconCreator {

  constructor(file: string, output?: string);

  public convert(): Promise<string | Buffer>;
}

export = IconCreator;
