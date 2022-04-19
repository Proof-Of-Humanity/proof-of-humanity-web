const fs = require("fs");
const path = require("path");

const { uploadToKleros } = require("./utils");

(async () => {
  const evidence = JSON.parse(
    fs.readFileSync(process.argv[2], { encoding: "utf8" })
  );

  await Promise.all(
    Object.keys(evidence.fileURI).map(async (key) => {
      const filePath = path.join(
        path.dirname(process.argv[2]),
        evidence.fileURI[key]
      );
      if (fs.existsSync(filePath)) {
        evidence.fileURI[key] = await uploadToKleros(filePath);
      }
    })
  );

  evidence.fileURI = await uploadToKleros(
    "evidence-file.json",
    Buffer.from(JSON.stringify(evidence.fileURI))
  );

  process.stdout.write(
    await uploadToKleros(process.argv[2], Buffer.from(JSON.stringify(evidence)))
  );
})();
