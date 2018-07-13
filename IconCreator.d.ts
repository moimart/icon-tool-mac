declare namespace Icns {

  declare class IconCreatorSharp {

    constructor(file: string, output?: string);
    public convert(): Promise<string | Buffer>;
  }

  declare class IconCreatorFile {

    constructor(file: string, output?: string);
    public useCLI(cli:boolean);
    public convert(): Promise<string | Buffer>;
  }

  declare class IconCreatorMemory {

    constructor(file: string, output?: string);
    public convert(): Promise<string | Buffer>;
  }
}

declare module "IconCreator" {
  export = {
    IconCreatorSharp: Icns.IconCreatorSharp
  }
}
