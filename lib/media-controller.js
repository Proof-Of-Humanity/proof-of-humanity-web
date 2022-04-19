import { createFFmpeg } from "@ffmpeg/ffmpeg";
import exif from "exifremove";
import Jimp from "jimp";
import fetch from "node-fetch";
import randomstring from "randomstring";
// const MAX_IMAGE_SIZE = 2 * 1000 * 1000 * 8; // in bits
// const MAX_VIDEO_SIZE = 7 * 1000 * 1000 * 8; // in bits

// Helpers
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

    if (red === green && green === blue) {
      isGrayscale = true;
    }

    return isGrayscale;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function rng() {
  return randomstring.generate({ length: 46 });
}

let ffmpeg;

const getFFmpegInstance = async () => {
  ffmpeg = createFFmpeg({
    log: false,
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  });

  await ffmpeg.load();
};

export async function loadFFMPEG() {
  if (!ffmpeg || !ffmpeg.isLoaded()) {
    await getFFmpegInstance();
  }
}

export function exitFFMPEG() {
  try {
    ffmpeg.exit();
  } catch (err) {
    console.error("Exit result", err);
  }

  ffmpeg = undefined;
}

export async function videoSanitizer(
  inputBuffer,
  size,
  OS,
  callback,
  mirrored,
  duration
) {
  try {
    await loadFFMPEG();

    ffmpeg.setProgress((progress) => {
      if (progress.time !== undefined) {
        callback(progress.time / duration);
      }
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

    // let videoFilters = ["-vf", "mpdecimate"];  // add duplicate frames removal?

    if (mirrored) {
      options.push("-vf", "hflip", "mpdecimate");
    } else {
      options.push("-vf", "mpdecimate");
    }

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

    ffmpeg.FS("writeFile", inputName, inputBuffer);
    await ffmpeg.run(...options);

    const _outputBuffer = ffmpeg.FS("readFile", outputFilename);
    const outputBuffer = Buffer.from(_outputBuffer);

    const videoURI = await upload(outputFilename, outputBuffer);

    ffmpeg.FS("unlink", inputName);
    ffmpeg.FS("unlink", outputFilename);

    return videoURI;
  } catch (err) {
    console.error(err);
  } finally {
    exitFFMPEG();
    // exit ffmpeg ?
  }
}

export async function photoSanitizer(buffer) {
  try {
    const image = await Jimp.read(buffer);
    const isGrayscale = await checkGrayscale(image);

    if (isGrayscale) {
      throw "image_grayscale";
    }

    const width = image.bitmap.width < 1080 ? image.bitmap.width : 1080;
    const height = image.bitmap.height < 1080 ? image.bitmap.height : 1080;
    const imageToJpg = await image
      .quality(95)
      .resize(width, height)
      .getBufferAsync(Jimp.MIME_JPEG);
    const imageJpgWithoutExif = exif.remove(imageToJpg);

    const filename = rng();
    const fileURI = await upload(`${filename}.jpg`, imageJpgWithoutExif);

    return fileURI;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Helpers
