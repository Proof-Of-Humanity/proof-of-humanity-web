const { uploadToKleros } = require("./utils");

(async () => {
  process.stdout.write(await uploadToKleros(process.argv[2]));
})();
