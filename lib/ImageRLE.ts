/*

From: https://github.com/kornelski/libicns/blob/master/src/icns_rle24.c
Copyright (C) 2001-2012 Mathew Eis <mathew@eisbox.net>
              2007 Thomas Lübking <thomas.luebking@web.de>
              2002 Chenxiao Zhao <chenxiao.zhao@gmail.com>

Ported to TypeScript by: (C) 2018 Moises Martinez <moises@kikkei.com>

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.
This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.
You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the
Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
Boston, MA 02110-1301, USA.

*/

export class ImageRLE {
  static decodeRLE(data:Buffer, expectedPixelCount:number):Buffer {

    let colorOffset = 0;
    let colorValue = 0; //byte
    let runLength = 0;
    let dataOffset = 4;
    let pixelOffset = 0;
    let rawDataSize = data.length - 4;
    let destIconData = Buffer.alloc(expectedPixelCount*4);

    for (colorOffset = 0; colorOffset < 3; colorOffset++) {
      pixelOffset = 0;
      while ((pixelOffset < expectedPixelCount) && (dataOffset < rawDataSize)) {
        if ((data[dataOffset] & 0x80) == 0) {
          runLength = (0xFF & data[dataOffset++]) + 1;

          for (let i = 0; (i < runLength) && (pixelOffset < expectedPixelCount) && (dataOffset < rawDataSize); i++) {
            destIconData[(pixelOffset * 4) + colorOffset] = data[dataOffset++];
            pixelOffset++;
          }
        } else {
          runLength = (0xFF & data[dataOffset++]) - 125;
          colorValue = data[dataOffset++];

          for (let i = 0; (i < runLength) && (pixelOffset < expectedPixelCount); i++) {
            destIconData[(pixelOffset * 4) + colorOffset] = colorValue;
            pixelOffset++
          }
        }
      }
    }

    return destIconData;
  }

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

    for (colorOffset = 0; colorOffset < 4; colorOffset++) {

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

          dataTemp[dataTempCount] = dataRun[0];
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
