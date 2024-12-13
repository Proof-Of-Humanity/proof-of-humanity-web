const fs = require("fs");
const path = require("path");

const fetch = require("isomorphic-unfetch");

function uploadToKleros(
  filePath,
  buffer = fs.readFileSync(filePath),
  operation = "evidence"
) {
  const payload = new FormData();
  payload.append("file", new Blob(buffer), path.basename(filePath));
  return fetch(
    `${process.env.NEXT_PUBLIC_COURT_FUNCTIONS_URL}/.netlify/functions/upload-to-ipfs?operation=${operation}&pinToGraph=false`,
    {
      method: "POST",
      body: payload,
    }
  )
    .then((res) => res.json())
    .then(({ cids }) => cids[0])
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log({ err });
    });
}

module.exports.uploadToKleros = uploadToKleros;
