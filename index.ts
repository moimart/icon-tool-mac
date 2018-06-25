import { IconCreator } from './lib/IconCreatorMemory'

if (process.argv.length < 3) {
  console.error('Please specify a file');
} else {
  let output = "icon.icns";

  if (process.argv.length <= 4) {
    output = process.argv[3] + ".icns";
  }

  let creator = new IconCreator(process.argv[2],output);

  creator.convert()
  .then((icon: string) => {
    console.log(`${icon}`);
  })
  .catch((error: string) => {
    console.error(error);
  });
}
