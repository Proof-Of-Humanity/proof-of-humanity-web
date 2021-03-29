const fs = require("fs");
const path = require("path");

const fetch = require("isomorphic-unfetch");

module.exports.uploadToKleros = (
  filePath,
  buffer = fs.readFileSync(filePath)
) =>
  fetch(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: path.basename(filePath),
      buffer,
    }),
  })
    .then((res) => res.json())
    .then(({ data }) => `/ipfs/${data[1].hash}${data[0].path}`);
