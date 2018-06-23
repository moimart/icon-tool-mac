declare class IconCreator {

  constructor(file: string, output?: string);
  public useCLI(cli:boolean);
  public convert(): Promise<string | Buffer>;
}

export = IconCreator;
