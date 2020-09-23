import { createUseDataloaders } from "@kleros/components";

const { getEvidenceFile: useEvidenceFile } = createUseDataloaders({
  async getEvidenceFile(
    {
      archon: {
        utils,
        arbitrable: { ipfsGateway },
      },
    },
    URI
  ) {
    const fetchFile = (_URI) =>
      utils
        .validateFileFromURI(ipfsGateway + _URI, {
          preValidated: true,
        })
        .then((res) => res.file);
    const file = await fetchFile(URI);
    if (file.fileURI) {
      const nestedFile = await fetchFile(file.fileURI);
      file.fileURI = ipfsGateway + file.fileURI;
      file.file = Object.keys(nestedFile).reduce((acc, key) => {
        if (acc[key].startsWith("/ipfs/")) acc[key] = ipfsGateway + acc[key];
        return acc;
      }, nestedFile);
    }
    return file;
  },
});
export { useEvidenceFile };
