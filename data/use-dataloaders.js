import { createUseDataloaders } from "@kleros/components";

const { getEvidenceFile: useEvidenceFile } = createUseDataloaders({
  async getEvidenceFile(archon, URI) {
    const fetchFile = (_URI) =>
      archon.utils
        .validateFileFromURI(archon.arbitrable.ipfsGateway + _URI, {
          preValidated: true,
        })
        .then((res) => res.file);
    const file = await fetchFile(URI);
    if (file.fileURI) {
      const nestedFile = await fetchFile(file.fileURI);
      file.fileURI = archon.arbitrable.ipfsGateway + file.fileURI;
      file.file = Object.keys(nestedFile).reduce((acc, key) => {
        if (acc[key].startsWith("/ipfs/"))
          acc[key] = archon.arbitrable.ipfsGateway + acc[key];
        return acc;
      }, nestedFile);
    }
    return file;
  },
});
export { useEvidenceFile };
