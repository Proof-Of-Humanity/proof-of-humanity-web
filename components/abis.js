export const erc20 = [
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "sender",
        type: "address",
      },
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    constant: true,
    inputs: [
      {
        name: "owner",
        type: "address",
      },
      {
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const escrow = [
  {
    constant: true,
    inputs: [],
    name: "arbitratorExtraData",
    outputs: [
      {
        name: "",
        type: "bytes",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "disputeIDtoTransactionID",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "arbitrator",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "transactions",
    outputs: [
      {
        name: "sender",
        type: "address",
      },
      {
        name: "receiver",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "timeoutPayment",
        type: "uint256",
      },
      {
        name: "disputeId",
        type: "uint256",
      },
      {
        name: "senderFee",
        type: "uint256",
      },
      {
        name: "receiverFee",
        type: "uint256",
      },
      {
        name: "lastInteraction",
        type: "uint256",
      },
      {
        name: "status",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "feeTimeout",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_arbitrator",
        type: "address",
      },
      {
        name: "_arbitratorExtraData",
        type: "bytes",
      },
      {
        name: "_feeTimeout",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_metaEvidenceID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_evidence",
        type: "string",
      },
    ],
    name: "MetaEvidence",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_transactionID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_party",
        type: "address",
      },
    ],
    name: "Payment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_transactionID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_party",
        type: "uint8",
      },
    ],
    name: "HasToPayFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_evidenceGroupID",
        type: "uint256",
      },
      {
        indexed: true,
        name: "_party",
        type: "address",
      },
      {
        indexed: false,
        name: "_evidence",
        type: "string",
      },
    ],
    name: "Evidence",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_disputeID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_metaEvidenceID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_evidenceGroupID",
        type: "uint256",
      },
    ],
    name: "Dispute",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_disputeID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_ruling",
        type: "uint256",
      },
    ],
    name: "Ruling",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_timeoutPayment",
        type: "uint256",
      },
      {
        name: "_receiver",
        type: "address",
      },
      {
        name: "_metaEvidence",
        type: "string",
      },
    ],
    name: "createTransaction",
    outputs: [
      {
        name: "transactionID",
        type: "uint256",
      },
    ],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "pay",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_amountReimbursed",
        type: "uint256",
      },
    ],
    name: "reimburse",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "executeTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "timeOutBySender",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "timeOutByReceiver",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "payArbitrationFeeBySender",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "payArbitrationFeeByReceiver",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_evidence",
        type: "string",
      },
    ],
    name: "submitEvidence",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "appeal",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_disputeID",
        type: "uint256",
      },
      {
        name: "_ruling",
        type: "uint256",
      },
    ],
    name: "rule",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getCountTransactions",
    outputs: [
      {
        name: "countTransactions",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "getTransactionIDsByAddress",
    outputs: [
      {
        name: "transactionIDs",
        type: "uint256[]",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const tokenEscrow = [
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "appeal",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_amount",
        type: "uint256",
      },
      {
        name: "_token",
        type: "address",
      },
      {
        name: "_timeoutPayment",
        type: "uint256",
      },
      {
        name: "_receiver",
        type: "address",
      },
      {
        name: "_metaEvidence",
        type: "string",
      },
    ],
    name: "createTransaction",
    outputs: [
      {
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "executeTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "pay",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "payArbitrationFeeByReceiver",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "payArbitrationFeeBySender",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_amountReimbursed",
        type: "uint256",
      },
    ],
    name: "reimburse",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_disputeID",
        type: "uint256",
      },
      {
        name: "_ruling",
        type: "uint256",
      },
    ],
    name: "rule",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
      {
        name: "_evidence",
        type: "string",
      },
    ],
    name: "submitEvidence",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "timeOutByReceiver",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_transactionID",
        type: "uint256",
      },
    ],
    name: "timeOutBySender",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        name: "_arbitrator",
        type: "address",
      },
      {
        name: "_arbitratorExtraData",
        type: "bytes",
      },
      {
        name: "_feeTimeout",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_transactionID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_amount",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_party",
        type: "address",
      },
    ],
    name: "Payment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_transactionID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_party",
        type: "uint8",
      },
    ],
    name: "HasToPayFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_disputeID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_ruling",
        type: "uint256",
      },
    ],
    name: "Ruling",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_metaEvidenceID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_evidence",
        type: "string",
      },
    ],
    name: "MetaEvidence",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_disputeID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_metaEvidenceID",
        type: "uint256",
      },
      {
        indexed: false,
        name: "_evidenceGroupID",
        type: "uint256",
      },
    ],
    name: "Dispute",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "_arbitrator",
        type: "address",
      },
      {
        indexed: true,
        name: "_evidenceGroupID",
        type: "uint256",
      },
      {
        indexed: true,
        name: "_party",
        type: "address",
      },
      {
        indexed: false,
        name: "_evidence",
        type: "string",
      },
    ],
    name: "Evidence",
    type: "event",
  },
  {
    constant: true,
    inputs: [],
    name: "arbitrator",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "arbitratorExtraData",
    outputs: [
      {
        name: "",
        type: "bytes",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "disputeIDtoTransactionID",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "feeTimeout",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getCountTransactions",
    outputs: [
      {
        name: "countTransactions",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address",
      },
    ],
    name: "getTransactionIDsByAddress",
    outputs: [
      {
        name: "transactionIDs",
        type: "uint256[]",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    name: "transactions",
    outputs: [
      {
        name: "sender",
        type: "address",
      },
      {
        name: "receiver",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "token",
        type: "address",
      },
      {
        name: "timeoutPayment",
        type: "uint256",
      },
      {
        name: "disputeId",
        type: "uint256",
      },
      {
        name: "senderFee",
        type: "uint256",
      },
      {
        name: "receiverFee",
        type: "uint256",
      },
      {
        name: "lastInteraction",
        type: "uint256",
      },
      {
        name: "status",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];
