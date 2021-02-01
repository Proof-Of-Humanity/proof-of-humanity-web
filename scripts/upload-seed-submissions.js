const fs = require("fs");
const path = require("path");

const { parse } = require("csv");

const { uploadToKleros } = require("./utils");

(async () => {
  const directory = path.dirname(process.argv[2]);
  const photosPath = path.join(directory, "photos");
  const videosPath = path.join(directory, "videos");
  const photos = fs.readdirSync(photosPath);
  const videos = fs.readdirSync(videosPath);

  const records = fs.createReadStream(process.argv[2]).pipe(parse());
  const addresses = [];
  const evidences = [];
  const names = [];
  const bios = [];
  for await (const record of records) {
    const address = record[7];
    const name = record[1];
    const bio = record[5];
    let evidence = {
      fileURI: {
        name,
        firstName: record[2],
        lastName: record[3],
        bio,
        photo: path.join(
          photosPath,
          photos.find(
            (photo) =>
              photo.slice(0, photo.indexOf(".")) ===
              String(addresses.length + 1)
          )
        ),
        video: path.join(
          videosPath,
          videos.find(
            (video) =>
              video.slice(0, video.indexOf(".")) ===
              String(addresses.length + 1)
          )
        ),
      },
      name: "Registration",
    };

    [evidence.fileURI.photo, evidence.fileURI.video] = await Promise.all([
      uploadToKleros(evidence.fileURI.photo),
      uploadToKleros(evidence.fileURI.video),
    ]);
    evidence.fileURI = await uploadToKleros(
      "evidence-file.json",
      Buffer.from(JSON.stringify(evidence.fileURI))
    );
    evidence = await uploadToKleros(
      "registration.json",
      Buffer.from(JSON.stringify(evidence))
    );

    addresses.push(address);
    evidences.push(evidence);
    names.push(name);
    bios.push(bio);
  }

  process.stdout.write("\n");
  process.stdout.write(JSON.stringify(addresses));
  process.stdout.write("\n");
  process.stdout.write(JSON.stringify(evidences));
  process.stdout.write("\n");
  process.stdout.write(JSON.stringify(names));
  process.stdout.write("\n");
  process.stdout.write(JSON.stringify(bios));
  process.stdout.write("\n");
})();
