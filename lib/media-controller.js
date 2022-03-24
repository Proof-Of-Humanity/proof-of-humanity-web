import fetch from 'node-fetch';
import randomstring from 'randomstring';

import exif from 'exifremove';
import Jimp from 'jimp';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const MAX_IMAGE_SIZE = 2 * 1000 * 1000 * 8;
const MAX_VIDEO_SIZE = 7 * 1000 * 1000 * 8;

const ffmpeg = createFFmpeg({ 
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
});

// Main functions
async function videoSanitizer(inputBuffer) {
  try {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    let inputName = rng();
    let outputName = rng();
    let outputFilename = `${outputName}.mp4`;

    let start = new Date().getTime();
    ffmpeg.FS('writeFile', inputName, inputBuffer);

    await ffmpeg.run(
      '-i', 
      inputName, 
      '-map_metadata',
      -1, 
      '-vcodec',
      'libx264',
      '-crf',
      '24',
      // '-crf',
      // 24,
      '-acodec',
      'mp3',
      // '-c',
      // 'copy',
      outputFilename
    );
    let end = new Date().getTime();
    
    let outputBuffer = ffmpeg.FS('readFile', outputFilename);

    console.log('ffmpeg time:', end - start);

    console.log('result', outputBuffer);

    start = new Date().getTime();
    let URI = await upload(outputFilename, outputBuffer);
    end = new Date().getTime();

    console.log('Kleros upload:', end - start);

    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputFilename);

    return URI;
  } catch (error) {
    console.log('Video handling error', error);
    return error;
  }
}

async function photoSanitizer(buffer) {
  try {
    let image = await Jimp.read(buffer);
    let imageToJpg = await image.quality(95).getBufferAsync(Jimp.MIME_JPEG);
    let imageJpgWithoutExif = exif.remove(imageToJpg);

    let filename = rng();
    let fileURI = await upload(`${filename}.jpg`, imageJpgWithoutExif);

    console.log('buffer=', buffer);
    console.log('image=', image);
    console.log('imageToJpg=', imageToJpg);
    console.log('imageJpgWithoutExif=', imageJpgWithoutExif);
    console.log('filename=', filename);
    console.log('fileURI=', fileURI);

    return fileURI;
  } catch (error) {
    console.log(`Photo handling error: ${error}`);
  }
}

// Helpers
function upload(fileName, buffer) {
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      fileName,
      buffer
    })
  };

  return fetch('https://ipfs.kleros.io/add', options).then(res => res.json()).then(({ data }) => `https://ipfs.kleros.io/ipfs/${data[1].hash}${data[0].path}`);
}

function rng() {
  return randomstring.generate({
    length: 46
  });
}

module.exports = {
  videoSanitizer,
  photoSanitizer,
};