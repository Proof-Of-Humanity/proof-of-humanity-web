import lodashChunk from "lodash.chunk";

function getVideoFrame(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  return canvas;
}

function getRotatedCanvas(canvas, theta) {
  const rotatedCanvas = document.createElement("canvas");
  rotatedCanvas.width = canvas.height;
  rotatedCanvas.height = canvas.width;

  const context = rotatedCanvas.getContext("2d");
  context.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  context.rotate(theta);
  context.drawImage(
    canvas,
    -rotatedCanvas.height / 2,
    -rotatedCanvas.width / 2
  );

  return rotatedCanvas;
}

function getCanvasRow(canvas, rowIndex) {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, rowIndex, canvas.width, 1);
  return lodashChunk(imageData.data, 4);
}

function getCanvasCol(canvas, columnIndex) {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(columnIndex, 0, 1, canvas.height);
  return lodashChunk(imageData.data, 4);
}

function getPixelColorDistance(a, b) {
  return (
    Math.abs(a[0] - b[0]) +
    Math.abs(a[1] - b[1]) +
    Math.abs(a[2] - b[2]) +
    Math.abs(a[3] - b[3])
  );
}

function arePixelsSimilar(a, b) {
  return getPixelColorDistance(a, b) < 5;
}

function getCanvasEmptyBorderWidth(canvas) {
  if (canvas.width < 2) return 0;

  const leftCol = getCanvasCol(canvas, 0);
  const rightCol = getCanvasCol(canvas, canvas.width - 1);
  const middleRow = getCanvasRow(canvas, Math.floor(canvas.height / 2));

  // Letterbox mattes are not necessarily true black, and also are
  // not always completely devoid of variation in color

  const hasLeftMatte = leftCol.every((p) => arePixelsSimilar(p, leftCol[0]));
  const hasRightMatte = rightCol.every((p) => arePixelsSimilar(p, rightCol[0]));

  const hasMatte = hasLeftMatte || hasRightMatte;
  if (!hasMatte) return 0;

  // count runs of contiguous-ish pixels starting from left and right sides
  const leftMatteWidth =
    middleRow.findIndex((p) => !arePixelsSimilar(p, middleRow[0])) + 1;
  const rightMatteWidth =
    middleRow.reverse().findIndex((p) => !arePixelsSimilar(p, middleRow[0])) +
    1;
  return leftMatteWidth + rightMatteWidth;
}

// Estimates letterbox matte size (total size of bars on sides of video)
// Requires that the `loadeddata` video event has already fired
export default function getVideoEmptyBorderSize(video) {
  if (video.preload !== "auto") throw new Error("Preloaded video required");

  const firstFrame = getVideoFrame(video);
  const rotatedFirstFrame = getRotatedCanvas(firstFrame, Math.PI / 2);
  return {
    width: getCanvasEmptyBorderWidth(firstFrame),
    height: getCanvasEmptyBorderWidth(rotatedFirstFrame),
  };
}
