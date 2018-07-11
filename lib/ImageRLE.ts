export class ImageRLE {
  static encodeRLE(data: Buffer): Buffer {
    let dataInCount = 0;
    let dataInChanSize = 0;
    let dataTempCount = 0;
    let colorOffset = 0;
    let dataByte = 0;
    let runType = 0;
    let runLength = 0;
    let runCount = 0;

    let dataTemp = Buffer.alloc(data.length * 1.25);
    dataTemp.fill(0);

    let dataRun = Buffer.alloc(140);
    dataRun.fill(0);

    dataInChanSize = data.length / 4;

    if (data.length >= 65536) {
      dataTempCount = 4;
    }

    for (colorOffset = 0; colorOffset < 3; colorOffset++) {

      runCount = 0;
      dataRun[0] = data[colorOffset];

      runLength = 1;

      runType = 0;

      for (dataInCount = 1; dataInCount < dataInChanSize; dataInCount++) {

        dataByte = data[colorOffset+(dataInCount*4)];

        if (runLength < 2) {
          dataRun[runLength++] = dataByte;
        } else if (runLength == 2) {

          if ( (dataByte == dataRun[runLength - 1]) && (dataByte == dataRun[runLength - 2])) {
            runType = 1;
          } else {
            runType = 0;
          }

          dataRun[runLength++] = dataByte;

        } else {

          if (runType == 0 && runLength < 128) {

            if ( (dataByte == dataRun[runLength - 1]) && (dataByte == dataRun[runLength - 2])) {

              dataTemp[dataTempCount] = runLength - 3;
              dataTempCount++;

              dataRun.copy(dataTemp,dataTempCount,0,runLength - 2);
              dataTempCount = dataTempCount + (runLength - 2);
              runCount++;

              dataRun[0] = dataRun[runLength - 2];
              dataRun[1] = dataRun[runLength - 1];
              dataRun[2] = dataByte;
              runLength = 3;
              runType = 1;
            } else {
              dataRun[runLength++] = dataByte;
            }
          } else if (runType == 1 && runLength < 130) {

            if ( (dataByte == dataRun[runLength - 1]) && (dataByte == dataRun[runLength - 2])) {
              dataRun[runLength++] = dataByte;
            } else {
              dataTemp[dataTempCount] = runLength + 125;
              dataTempCount++;

              dataTemp[dataTempCount] = dataRun[0];
              dataTempCount++;
              runCount++;

              dataRun[0] = dataByte;
              runLength = 1;
              runType = 0;
            }
          } else {

            if (runType == 0) {

              dataTemp[dataTempCount] = runLength - 1;
              dataTempCount++;

              dataRun.copy(dataTemp,dataTempCount,0,runLength);
              dataTempCount = dataTempCount + runLength;
            } else if (runType == 1) {
              dataTemp[dataTempCount] = runLength + 125;
              dataTempCount++;

              dataTemp[dataTempCount] = dataRun[0];
              dataTempCount++;
            }

            runCount++;

            dataRun[0] = dataByte;
            runLength = 1;
            runType = 0;
          }
        }
      }

      if (runLength > 0) {

        if (runType == 0) {
          dataTemp[dataTempCount] = runLength - 1;
          dataTempCount++;

          dataRun.copy(dataTemp,dataTempCount,0,runLength);
          dataTempCount = dataTempCount + runLength;
        } else if (runType == 1) {

          dataTemp[dataTempCount] = runLength + 125;
          dataTempCount++;

          dataTemp[dataTempCount] = dataRun[9];
          dataTempCount++;
        }

        runCount++;
      }
    }

    let nb = Buffer.alloc(dataTempCount);
    dataTemp.copy(nb,0,0,dataTempCount);

    return Buffer.concat([Buffer.from('ARGB','ascii'),nb]);
  }
}
