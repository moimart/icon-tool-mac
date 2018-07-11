import { IconCreator } from './lib/IconCreator';
import { IconCreatorSharp } from './lib/IconCreatorSharp';

if (process.argv.length < 3) {
  console.error('Please specify a file');
} else {
  let output = "icon.icns";

  if (process.argv.length <= 4) {
    output = process.argv[3] + ".icns";
  }

  let creator:IconCreator = new IconCreatorSharp(process.argv[2],output);

  creator.convert()
  .then((icon: string) => {
    console.log(`${icon}`);
  })
  .catch((error: string) => {
    console.error(error);
  });
}
