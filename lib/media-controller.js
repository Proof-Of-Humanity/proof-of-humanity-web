import { createFFmpeg } from "@ffmpeg/ffmpeg";
import exif from "exifremove";
import Jimp from "jimp";
import fetch from "node-fetch";
import randomstring from "randomstring";
// const MAX_IMAGE_SIZE = 2 * 1000 * 1000 * 8; // in bits
// const MAX_VIDEO_SIZE = 7 * 1000 * 1000 * 8; // in bits

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
});

async function upload(fileName, buffer) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, buffer }),
  };
  const URI = await fetch("https://ipfs.kleros.io/add", options)
    .then((res) => res.json())
    .then(
      ({ data }) => `https://ipfs.kleros.io/ipfs/${data[1].hash}${data[0].path}`
    );
  return URI;
}
async function checkGrayscale(image) {
  // console.log("checking for grayscale")
  try {
    let red = 0;
    let green = 0;
    let blue = 0;
    let isGrayscale = false;
    await image.scan(
      0,
      0,
      image.bitmap.width,
      image.bitmap.height,
      function (x, y, idx) {
        red += this.bitmap.data[idx + 0];
        green += this.bitmap.data[idx + 1];
        blue += this.bitmap.data[idx + 2];
      }
    );
    // console.log(red,green,blue)
    if (red === green && green === blue) isGrayscale = true;

    // console.log(isGrayscale)
    return isGrayscale;
  } catch {
    // console.log(err)
  }
}

function rng() {
  return randomstring.generate({ length: 46 });
}
// Main functions
export function loadFFMPEG () {
  if (!ffmpeg.isLoaded()) ffmpeg.load();
}
export async function videoSanitizer(inputBuffer, size, OS, callback) {
  try {
    // console.log(cb)
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    ffmpeg.setProgress(({ ratio }) => {
      callback(ratio);
      // console.log(saveProgress);
      // console.log('progress', ratio);
    });

    const inputName = rng();
    const outputName = rng();
    const outputFilename = `${outputName}.mp4`;

    const options = [
      "-i",
      inputName,
      "-map_metadata",
      -1,
      "-c:v",
      "libx264",
      "-c:a",
      "mp3",
      "-crf",
      "26",
      "-preset",
      "superfast",
    ];

    // if (size * 8 > MAX_VIDEO_SIZE) {
    // console.log('Video size exceeding maximum...');

    // let target_size = MAX_VIDEO_SIZE;
    // let length_round_up = Math.ceil(duration);
    // let total_bitrate = Math.floor(target_size / length_round_up);
    // let audio_bitrate = 128000; // 128 kb/s audio
    // let video_bitrate = total_bitrate - audio_bitrate;

    // console.log('total_length=', length_round_up);
    // console.log('audio_bitrate=', audio_bitrate);
    // console.log('video_bitrate=', video_bitrate);

    // options.push(
    //     '-b:v', '1500k',
    //     '-maxrate:v', '1500k',
    //     '-b:a', '128k',
    //     // '-bufsize:v' , Math.floor(target_size / 20),
    // );
    // }

    options.push(outputFilename);

    // let start = new Date().getTime();
    ffmpeg.FS("writeFile", inputName, inputBuffer);
    await ffmpeg.run(...options);

    // let end = new Date().getTime();

    const outputBuffer = ffmpeg.FS("readFile", outputFilename);

    // console.log('ffmpeg time:', end - start);

    // start = new Date().getTime();
    const videoURI = await upload(outputFilename, Buffer.from(outputBuffer));
    // end = new Date().getTime();

    // console.log('Kleros upload:', end - start);

    ffmpeg.FS("unlink", inputName);
    ffmpeg.FS("unlink", outputFilename);
    return videoURI;
  } catch (err) {
    // console.log('Video handling error', error);
    return err;
  }
}

export async function photoSanitizer(buffer) {
  try {
    // console.log("running img works")
    const image = await Jimp.read(buffer);
    const grayscale = await checkGrayscale(image);
    if (grayscale === false) {
      const imageToJpg = await image.quality(95).getBufferAsync(Jimp.MIME_JPEG);
      const imageJpgWithoutExif = exif.remove(imageToJpg);

      const filename = rng();
      const fileURI = await upload(`${filename}.jpg`, imageJpgWithoutExif);

      // console.log('filename=', filename);
      // console.log('fileURI=', fileURI);

      return fileURI;
    }
    return "grayscale";
  } catch (err) {
    console.error(`Photo handling error: ${err}`);
    return "error";
  }
}

// Helpers
