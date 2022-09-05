/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PRBMathUint, PRBMathUintInterface } from "../PRBMathUint";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__CeilOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__Exp2InputTooBig",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__ExpInputTooBig",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__FromUintOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__GmOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__LogInputTooSmall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "PRBMathUD60x18__SqrtOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivFixedPointOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prod1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "denominator",
        type: "uint256",
      },
    ],
    name: "PRBMath__MulDivOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "avg",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "ceil",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "div",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "e",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "exp",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "exp2",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "floor",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "frac",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "fromUint",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "gm",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "inv",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "ln",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "log10",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "log2",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "mul",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "pi",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "pow",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "powu",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "scale",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "sqrt",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "toUint",
    outputs: [
      {
        internalType: "uint256",
        name: "result",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x611ece61003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106101415760003560e01c80637d2b1efb116100c2578063c8a4ac9c11610086578063c8a4ac9c14610288578063db1400681461029b578063e3814b19146102bb578063ebdae5f9146102ce578063f51e181a146102e1578063ffae15ba146102ef57600080fd5b80637d2b1efb1461022957806399a04f2f1461023c578063a391c15b1461024f578063a75826ae14610262578063b581fbe31461027557600080fd5b80635456bf13116101095780635456bf13146101c157806357f5c63c146101d4578063677342ce146101e7578063728e8c7f146101fa5780637a142f2e1461021657600080fd5b806324d4e90a146101465780632dd9868d1461016b5780632e4c697f1461017957806340f0a21f1461018c578063504f5e561461019f575b600080fd5b610159610154366004611e21565b6102fd565b60405190815260200160405180910390f35b672b992ddfa23249d6610159565b610159610187366004611e3a565b61032f565b61015961019a366004611e21565b610372565b6101596101ad366004611e21565b670de0b6b3a7640000810680151502900390565b6101596101cf366004611e21565b6103bd565b6101596101e2366004611e21565b61046d565b6101596101f5366004611e21565b61047e565b610159610208366004611e21565b670de0b6b3a7640000900690565b610159610224366004611e21565b6104d0565b610159610237366004611e3a565b6104f0565b61015961024a366004611e3a565b61054b565b61015961025d366004611e3a565b6105a5565b610159610270366004611e21565b6105ba565b610159610283366004611e21565b610607565b610159610296366004611e3a565b61065d565b6101596102a9366004611e3a565b600182811c82821c0192909116160190565b6101596102c9366004611e21565b610669565b6101596102dc366004611e21565b6106b6565b670de0b6b3a7640000610159565b6725b946ebc0b36173610159565b60006714057b7ef767814f670de0b6b3a764000061031a846103bd565b028161032857610328611e5c565b0492915050565b60008261035457811561034357600061034d565b670de0b6b3a76400005b905061036c565b610369610270610363856103bd565b8461065d565b90505b92915050565b600067081ad01a501bffff198211156103a657604051630ecebb1160e31b8152600481018390526024015b60405180910390fd5b50670de0b6b3a76400008082068015159103020190565b6000670de0b6b3a76400008210156103eb57604051633621413760e21b81526004810183905260240161039d565b6000610400670de0b6b3a7640000840461134b565b670de0b6b3a7640000808202935090915083821c90811415610423575050919050565b6706f05b59d3b200005b801561046557670de0b6b3a7640000828002049150671bc16d674ec80000821061045d579283019260019190911c905b60011c61042d565b505050919050565b6000670de0b6b3a764000082610328565b60007812725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f218211156104bd57604051636155b67d60e01b81526004810183905260240161039d565b61036c670de0b6b3a7640000830261142a565b6000816ec097ce7bc90715b34b9f10000000008161032857610328611e5c565b6000826104ff5750600061036c565b8282028284828161051257610512611e5c565b041461053a5760405162c3efdf60e01b8152600481018590526024810184905260440161039d565b6105438161142a565b949350505050565b600080826001161161056557670de0b6b3a7640000610567565b825b9050600182901c91505b811561036c576105818384611596565b92506001821615610599576105968184611596565b90505b600182901c9150610571565b600061036983670de0b6b3a764000084611658565b6000680a688906bd8b00000082106105e857604051634a4f26f160e01b81526004810183905260240161039d565b670de0b6b3a7640000604083901b0461060081611725565b9392505050565b6000680736ea4425c11ac63182106106355760405163062bb40d60e31b81526004810183905260240161039d565b6714057b7ef767814f8202610600670de0b6b3a76400006706f05b59d3b200008301046105ba565b60006103698383611596565b60007812725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f218211156106a857604051633492ffd960e01b81526004810183905260240161039d565b50670de0b6b3a76400000290565b6000670de0b6b3a76400008210156106e457604051633621413760e21b81526004810183905260240161039d565b8160018114610e1057600a8114610e215760648114610e32576103e88114610e43576127108114610e5457620186a08114610e6557620f42408114610e7657629896808114610e87576305f5e1008114610e9857633b9aca008114610ea9576402540be4008114610eba5764174876e8008114610ecb5764e8d4a510008114610edc576509184e72a0008114610eed57655af3107a40008114610efe5766038d7ea4c680008114610f0f57662386f26fc100008114610f205767016345785d8a00008114610f3157670de0b6b3a76400008114610f4257678ac7230489e800008114610f4b5768056bc75e2d631000008114610f5b57683635c9adc5dea000008114610f6b5769021e19e0c9bab24000008114610f7b5769152d02c7e14af68000008114610f8b5769d3c21bcecceda10000008114610f9b576a084595161401484a0000008114610fab576a52b7d2dcc80cd2e40000008114610fbb576b033b2e3c9fd0803ce80000008114610fcb576b204fce5e3e250261100000008114610fdb576c01431e0fae6d7217caa00000008114610feb576c0c9f2c9cd04674edea400000008114610ffb576c7e37be2022c0914b2680000000811461100b576d04ee2d6d415b85acef8100000000811461101b576d314dc6448d9338c15b0a00000000811461102b576e01ed09bead87c0378d8e6400000000811461103b576e13426172c74d822b878fe800000000811461104b576ec097ce7bc90715b34b9f1000000000811461105b576f0785ee10d5da46d900f436a000000000811461106b576f4b3b4ca85a86c47a098a224000000000811461107c577002f050fe938943acc45f65568000000000811461108d57701d6329f1c35ca4bfabb9f5610000000000811461109e57710125dfa371a19e6f7cb54395ca000000000081146110af57710b7abc627050305adf14a3d9e4000000000081146110c0577172cb5bd86321e38cb6ce6682e8000000000081146110d15772047bf19673df52e37f2410011d10000000000081146110e257722cd76fe086b93ce2f768a00b22a0000000000081146110f3577301c06a5ec5433c60ddaa16406f5a40000000000081146111045773118427b3b4a05bc8a8a4de84598680000000000081146111155773af298d050e4395d69670b12b7f410000000000008114611126577406d79f82328ea3da61e066ebb2f88a00000000000081146111375774446c3b15f9926687d2c40534fdb5640000000000008114611148577502ac3a4edbbfb8014e3ba83411e915e8000000000000811461115957751aba4714957d300d0e549208b31adb10000000000000811461116a5776010b46c6cdd6e3e0828f4db456ff0c8ea0000000000000811461117b57760a70c3c40a64e6c51999090b65f67d9240000000000000811461118c57766867a5a867f103b2fffa5a71fba0e7b680000000000000811461119d577704140c78940f6a24fdffc78873d4490d210000000000000081146111ae577728c87cb5c89a2571ebfdcb54864ada834a0000000000000081146111bf57780197d4df19d605767337e9f14d3eec8920e40000000000000081146111d057780fee50b7025c36a0802f236d04753d5b48e80000000000000081146111e157789f4f2726179a224501d762422c946590d9100000000000000081146111f25779063917877cec0556b21269d695bdcbf7a87aa000000000000000811461120357793e3aeb4ae1383562f4b82261d969f7ac94ca40000000000000008114611214577a026e4d30eccc3215dd8f3157d27e23acbdcfe680000000000000008114611225577a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008114611236577af316271c7fc3908a8bef464e3945ef7a25360a00000000000000008114611247577b097edd871cfda3a5697758bf0e3cbb5ac5741c6400000000000000008114611258577b5ef4a74721e864761ea977768e5f518bb6891be800000000000000008114611269577c03b58e88c75313ec9d329eaaa18fb92f75215b17100000000000000000811461127a577c25179157c93ec73e23fa32aa4f9d3bda934d8ee6a00000000000000000811461128b577d0172ebad6ddc73c86d67c5faa71c245689c1079502400000000000000000811461129c577d0e7d34c64a9c85d4460dbbca87196b61618a4bd21680000000000000000081146112ad577d90e40fbeea1d3a4abc8955e946fe31cdcf66f634e100000000000000000081146112be577e05a8e89d75252446eb5d5d5b1cc5edf20a1a059e10ca00000000000000000081146112cf577e3899162693736ac531a5a58f1fbb4b746504382ca7e400000000000000000081146112e0577546bf5bb0385045767e0f0ef2e7aa1e517e454637d1dd604b1b81146112f1577f161bcca7119915b50764b4abe86529797775a5f17195100000000000000000008114611302577fdd15fe86affad91249ef0eb713f39ebeaa987b6e6fd2a00000000000000000008114611313576000199150611320565b67f9ccd8a1c507ffff199150611320565b67ebec21ee1da3ffff199150611320565b67de0b6b3a763fffff199150611320565b67d02ab486cedbffff199150611320565b67c249fdd32777ffff199150611320565b67b469471f8013ffff199150611320565b67a688906bd8afffff199150611320565b6798a7d9b8314bffff199150611320565b678ac7230489e7ffff199150611320565b677ce66c50e283ffff199150611320565b676f05b59d3b1fffff199150611320565b676124fee993bbffff199150611320565b6753444835ec57ffff199150611320565b674563918244f3ffff199150611320565b673782dace9d8fffff199150611320565b6729a2241af62bffff199150611320565b671bc16d674ec7ffff199150611320565b670de0b6b3a763ffff199150611320565b60009150611320565b670de0b6b3a76400009150611320565b671bc16d674ec800009150611320565b6729a2241af62c00009150611320565b673782dace9d9000009150611320565b674563918244f400009150611320565b6753444835ec5800009150611320565b676124fee993bc00009150611320565b676f05b59d3b2000009150611320565b677ce66c50e28400009150611320565b678ac7230489e800009150611320565b6798a7d9b8314c00009150611320565b67a688906bd8b000009150611320565b67b469471f801400009150611320565b67c249fdd3277800009150611320565b67d02ab486cedc00009150611320565b67de0b6b3a764000009150611320565b67ebec21ee1da400009150611320565b67f9ccd8a1c50800009150611320565b680107ad8f556c6c00009150611320565b6801158e460913d000009150611320565b6801236efcbcbb3400009150611320565b6801314fb370629800009150611320565b68013f306a2409fc00009150611320565b68014d1120d7b16000009150611320565b68015af1d78b58c400009150611320565b680168d28e3f002800009150611320565b680176b344f2a78c00009150611320565b68018493fba64ef000009150611320565b68019274b259f65400009150611320565b6801a055690d9db800009150611320565b6801ae361fc1451c00009150611320565b6801bc16d674ec8000009150611320565b6801c9f78d2893e400009150611320565b6801d7d843dc3b4800009150611320565b6801e5b8fa8fe2ac00009150611320565b6801f399b1438a1000009150611320565b6802017a67f7317400009150611320565b68020f5b1eaad8d800009150611320565b68021d3bd55e803c00009150611320565b68022b1c8c1227a000009150611320565b680238fd42c5cf0400009150611320565b680246ddf979766800009150611320565b680254beb02d1dcc00009150611320565b6802629f66e0c53000009150611320565b680270801d946c9400009150611320565b68027e60d44813f800009150611320565b68028c418afbbb5c00009150611320565b68029a2241af62c000009150611320565b6802a802f8630a2400009150611320565b6802b5e3af16b18800009150611320565b6802c3c465ca58ec00009150611320565b6802d1a51c7e005000009150611320565b6802df85d331a7b400009150611320565b6802ed6689e54f1800009150611320565b6802fb474098f67c00009150611320565b68030927f74c9de000009150611320565b68031708ae00454400009150611320565b680324e964b3eca800009150611320565b680332ca1b67940c000091505b5060001981141561134657672e19dc008126bf2b670de0b6b3a764000061031a846103bd565b919050565b6000600160801b821061136b57608091821c916113689082611e72565b90505b600160401b821061138957604091821c916113869082611e72565b90505b64010000000082106113a857602091821c916113a59082611e72565b90505b6201000082106113c557601091821c916113c29082611e72565b90505b61010082106113e157600891821c916113de9082611e72565b90505b601082106113fc57600491821c916113f99082611e72565b90505b6004821061141757600291821c916114149082611e72565b90505b600282106113465761036c600182611e72565b60008161143957506000919050565b50600181600160801b81106114535760409190911b9060801c5b600160401b81106114695760209190911b9060401c5b64010000000081106114805760109190911b9060201c5b6201000081106114955760089190911b9060101c5b61010081106114a95760049190911b9060081c5b601081106114bc5760029190911b9060041c5b600881106114cc57600182901b91505b60018284816114dd576114dd611e5c565b048301901c915060018284816114f5576114f5611e5c565b048301901c9150600182848161150d5761150d611e5c565b048301901c9150600182848161152557611525611e5c565b048301901c9150600182848161153d5761153d611e5c565b048301901c9150600182848161155557611555611e5c565b048301901c9150600182848161156d5761156d611e5c565b048301901c9150600082848161158557611585611e5c565b049050808310156106005782610543565b60008080600019848609848602925082811083820303915050670de0b6b3a764000081106115da5760405163698d9a0160e11b81526004810182905260240161039d565b600080670de0b6b3a76400008688099150506706f05b59d3b1ffff8111826116145780670de0b6b3a764000085040194505050505061036c565b620400008285030493909111909103600160ee1b02919091177faccb18165bd6fe31ae1cf318dc5b51eee0e1ba569b88cd74c1773b91fac106690201905092915050565b6000808060001985870985870292508281108382030391505080600014156116935783828161168957611689611e5c565b0492505050610600565b8381106116bd57604051631dcf306360e21b8152600481018290526024810185905260440161039d565b600084868809600260036001881981018916988990049182028318808302840302808302840302808302840302808302840302808302840302918202909203026000889003889004909101858311909403939093029303949094049190911702949350505050565b600160bf1b6780000000000000008216156117495768016a09e667f3bcc9090260401c5b674000000000000000821615611768576801306fe0a31b7152df0260401c5b672000000000000000821615611787576801172b83c7d517adce0260401c5b6710000000000000008216156117a65768010b5586cf9890f62a0260401c5b6708000000000000008216156117c5576801059b0d31585743ae0260401c5b6704000000000000008216156117e457680102c9a3e778060ee70260401c5b6702000000000000008216156118035768010163da9fb33356d80260401c5b67010000000000000082161561182257680100b1afa5abcbed610260401c5b66800000000000008216156118405768010058c86da1c09ea20260401c5b664000000000000082161561185e576801002c605e2e8cec500260401c5b662000000000000082161561187c57680100162f3904051fa10260401c5b661000000000000082161561189a576801000b175effdc76ba0260401c5b66080000000000008216156118b857680100058ba01fb9f96d0260401c5b66040000000000008216156118d65768010002c5cc37da94920260401c5b66020000000000008216156118f4576801000162e525ee05470260401c5b66010000000000008216156119125768010000b17255775c040260401c5b6580000000000082161561192f576801000058b91b5bc9ae0260401c5b6540000000000082161561194c57680100002c5c89d5ec6d0260401c5b652000000000008216156119695768010000162e43f4f8310260401c5b6510000000000082161561198657680100000b1721bcfc9a0260401c5b650800000000008216156119a35768010000058b90cf1e6e0260401c5b650400000000008216156119c0576801000002c5c863b73f0260401c5b650200000000008216156119dd57680100000162e430e5a20260401c5b650100000000008216156119fa576801000000b1721835510260401c5b648000000000821615611a1657680100000058b90c0b490260401c5b644000000000821615611a325768010000002c5c8601cc0260401c5b642000000000821615611a4e576801000000162e42fff00260401c5b641000000000821615611a6a5768010000000b17217fbb0260401c5b640800000000821615611a86576801000000058b90bfce0260401c5b640400000000821615611aa257680100000002c5c85fe30260401c5b640200000000821615611abe5768010000000162e42ff10260401c5b640100000000821615611ada57680100000000b17217f80260401c5b6380000000821615611af55768010000000058b90bfc0260401c5b6340000000821615611b10576801000000002c5c85fe0260401c5b6320000000821615611b2b57680100000000162e42ff0260401c5b6310000000821615611b46576801000000000b17217f0260401c5b6308000000821615611b6157680100000000058b90c00260401c5b6304000000821615611b7c5768010000000002c5c8600260401c5b6302000000821615611b97576801000000000162e4300260401c5b6301000000821615611bb25768010000000000b172180260401c5b62800000821615611bcc576801000000000058b90c0260401c5b62400000821615611be657680100000000002c5c860260401c5b62200000821615611c005768010000000000162e430260401c5b62100000821615611c1a57680100000000000b17210260401c5b62080000821615611c345768010000000000058b910260401c5b62040000821615611c4e576801000000000002c5c80260401c5b62020000821615611c6857680100000000000162e40260401c5b62010000821615611c82576801000000000000b1720260401c5b618000821615611c9b57680100000000000058b90260401c5b614000821615611cb45768010000000000002c5d0260401c5b612000821615611ccd576801000000000000162e0260401c5b611000821615611ce65768010000000000000b170260401c5b610800821615611cff576801000000000000058c0260401c5b610400821615611d1857680100000000000002c60260401c5b610200821615611d3157680100000000000001630260401c5b610100821615611d4a57680100000000000000b10260401c5b6080821615611d6257680100000000000000590260401c5b6040821615611d7a576801000000000000002c0260401c5b6020821615611d9257680100000000000000160260401c5b6010821615611daa576801000000000000000b0260401c5b6008821615611dc257680100000000000000060260401c5b6004821615611dda57680100000000000000030260401c5b6002821615611df257680100000000000000010260401c5b6001821615611e0a57680100000000000000010260401c5b670de0b6b3a76400000260409190911c60bf031c90565b600060208284031215611e3357600080fd5b5035919050565b60008060408385031215611e4d57600080fd5b50508035926020909101359150565b634e487b7160e01b600052601260045260246000fd5b60008219821115611e9357634e487b7160e01b600052601160045260246000fd5b50019056fea264697066735822122079b9b753ad93f594c5fbb19375f224d4454dea7f7d303a10f4d4081ebb57b39664736f6c63430008090033";

type PRBMathUintConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PRBMathUintConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PRBMathUint__factory extends ContractFactory {
  constructor(...args: PRBMathUintConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PRBMathUint> {
    return super.deploy(overrides || {}) as Promise<PRBMathUint>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): PRBMathUint {
    return super.attach(address) as PRBMathUint;
  }
  connect(signer: Signer): PRBMathUint__factory {
    return super.connect(signer) as PRBMathUint__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PRBMathUintInterface {
    return new utils.Interface(_abi) as PRBMathUintInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PRBMathUint {
    return new Contract(address, _abi, signerOrProvider) as PRBMathUint;
  }
}
