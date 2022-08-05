import ArchonProvider, { createUseDataloaders } from "./archon-provider";
import Evidence from "./evidence";
import Web3Provider from "./web3-provider";

import ProofOfHumanity from "subgraph/abis/proof-of-humanity";
import { address } from "subgraph/config";

const metadata = {
  title: "Arbitration/Evidence",
  component: Evidence,
  argTypes: {
    contract: {
      type: { name: "string", required: true },
      description: "The arbitrable contract name in the Web3 Provider.",
      table: {
        type: {
          summary: "string",
        },
      },
    },
    args: {
      type: { name: "array", required: true },
      description: "Arguments to pass to the submitEvidence function.",
      table: {
        type: {
          summary: "array",
        },
      },
    },
    evidence: {
      type: { name: "array", required: true },
      description: "The list of evidence objects.",
      table: {
        type: {
          summary: "array",
        },
      },
    },
    useEvidenceFile: {
      type: { name: "function", required: true },
      description: "Archon provider based evidence `dataloader` hook.",
      table: {
        type: {
          summary: "function",
        },
      },
    },
  },
};
export default metadata;

const network = process.env.NEXT_PUBLIC_NETWORK || "mainnet";

const contracts = [
  {
    name: "proofOfHumanity",
    abi: ProofOfHumanity,
    address: { [network]: address },
  },
];
function Template(args) {
  return (
    <Web3Provider
      infuraURL={process.env.NEXT_PUBLIC_INFURA_ENDPOINT}
      contracts={contracts}
    >
      <ArchonProvider>
        <Evidence {...args} />
      </ArchonProvider>
    </Web3Provider>
  );
}

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
        if (acc[key].startsWith("/ipfs/")) {
          acc[key] = ipfsGateway + acc[key];
        }
        return acc;
      }, nestedFile);
    }
    return file;
  },
});

export const NoScroll = Template.bind();
NoScroll.args = {
  contract: "proofOfHumanity",
  args: ["0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B"],
  evidence: [
    {
      creationTime: 1600618084,
      id: "0x1fccae975b215ef48287818baf62e875dab84510bb17b90390274426e6f3beb4",
      URI: "/ipfs/QmNc8osXHsxkU3AJceKfDvKG6vgKBAuwKrjAXeF1LjLVpg/evidence.json",
      sender: "0x6695dc16e6c3e1f0d62f30355d7848a3cb37517a",
    },
    {
      creationTime: 1600617960,
      id: "0x464c831f8e842f33f6e020dcbe32bfe482270ba519a3af47eeaed44f2134ca94",
      URI: "/ipfs/QmX7CwChSx5hoczvoLyY3EHvsvDpVWqrCkGc8iq9HRwJyC/evidence.json",
      sender: "0x6695dc16e6c3e1f0d62f30355d7848a3cb37517a",
    },
    {
      creationTime: 1599596964,
      id: "0x07bf8db105cb13b5437fdc28e614cc805a9d69d172edd99f42464960764eae0b",
      URI: "/ipfs/QmR5nGY21KnsPGx87FhG4czb3ueajWeSFEzpbQkZ9svtYD/registration.json",
      sender: "0x4b93a94ca58594faf5f64948a26f3e195eb63b6e",
    },
  ],
  useEvidenceFile,
};

export const Scroll = Template.bind();
Scroll.args = {
  contract: "proofOfHumanity",
  args: ["0xDb3ea8CbFd37D558eAcF8d0352bE3701352C1D9B"],
  evidence: [
    {
      creationTime: 1600618084,
      id: "0x1fccae975b215ef48287818baf62e875dab84510bb17b90390274426e6f3beb5",
      URI: "/ipfs/QmNc8osXHsxkU3AJceKfDvKG6vgKBAuwKrjAXeF1LjLVpg/evidence.json",
      sender: "0x6695dc16e6c3e1f0d62f30355d7848a3cb37517a",
    },
    {
      creationTime: 1600618084,
      id: "0x1fccae975b215ef48287818baf62e875dab84510bb17b90390274426e6f3beb4",
      URI: "/ipfs/QmNc8osXHsxkU3AJceKfDvKG6vgKBAuwKrjAXeF1LjLVpg/evidence.json",
      sender: "0x6695dc16e6c3e1f0d62f30355d7848a3cb37517a",
    },
    {
      creationTime: 1600617960,
      id: "0x464c831f8e842f33f6e020dcbe32bfe482270ba519a3af47eeaed44f2134ca94",
      URI: "/ipfs/QmX7CwChSx5hoczvoLyY3EHvsvDpVWqrCkGc8iq9HRwJyC/evidence.json",
      sender: "0x6695dc16e6c3e1f0d62f30355d7848a3cb37517a",
    },
    {
      creationTime: 1599596964,
      id: "0x07bf8db105cb13b5437fdc28e614cc805a9d69d172edd99f42464960764eae0b",
      URI: "/ipfs/QmR5nGY21KnsPGx87FhG4czb3ueajWeSFEzpbQkZ9svtYD/registration.json",
      sender: "0x4b93a94ca58594faf5f64948a26f3e195eb63b6e",
    },
  ],
  useEvidenceFile,
};
