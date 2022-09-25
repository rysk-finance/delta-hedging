import { BigNumber } from "ethers";
import { Currency as Token, ETHNetwork } from "../types";

export const MAX_UINT_256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export const ZERO_UINT_256 = "0x00";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const DECIMALS: Record<Token, number> = {
  USDC: 6,
  OPYN: 8,
  RYSK: 18,
};

// Using strings in constructor to avoid JS max int issues.
export const BIG_NUMBER_DECIMALS: Record<Token, BigNumber> = {
  USDC: BigNumber.from("1000000"),
  OPYN: BigNumber.from("100000000"),
  RYSK: BigNumber.from("1000000000000000000"),
};
// Ethers event polling interval
export const DEFAULT_POLLING_INTERVAL = 20000;

// Proportion added to approval transaction to account for price moving.
const APPROVAL_MARGIN = 0.1;

// Storing as percent to avoid BigNumber issues.
export const GAS_LIMIT_MULTIPLIER_PERCENTAGE = BigNumber.from(120);

export enum CHAINID {
  ETH_MAINNET = 1,
  ARBITRUM_MAINNET = 42161,
  ARBITRUM_RINKEBY = 421611,
  LOCALHOST = 1337,
}

export const IDToNetwork: Record<CHAINID, ETHNetwork> = {
  [CHAINID.ETH_MAINNET]: ETHNetwork.MAINNET,
  [CHAINID.ARBITRUM_MAINNET]: ETHNetwork.ARBITRUM_MAINNET,
  [CHAINID.ARBITRUM_RINKEBY]: ETHNetwork.ARBITRUM_RINKEBY,
  [CHAINID.LOCALHOST]: ETHNetwork.LOCALHOST,
};

export const RPC_URL_MAP: Record<CHAINID, string> = {
  [CHAINID.ETH_MAINNET]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  [CHAINID.ARBITRUM_MAINNET]: `https://arbitrum-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  [CHAINID.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`,
  [CHAINID.LOCALHOST]: "",
};

export const SUBGRAPH_URL = {
  [CHAINID.LOCALHOST]: "",
  [CHAINID.ETH_MAINNET]: "",
  [CHAINID.ARBITRUM_RINKEBY]:
    "https://api.thegraph.com/subgraphs/name/ugolino/rysktestnet",
  [CHAINID.ARBITRUM_MAINNET]: 
    "https://api.thegraph.com/subgraphs/name/rysk-finance/rysk",
};

export const OPYN_SUBGRAPH_URL = {
  [CHAINID.LOCALHOST]: "",
  [CHAINID.ETH_MAINNET]: "",
  [CHAINID.ARBITRUM_RINKEBY]:
    "https://api.thegraph.com/subgraphs/name/ugolino/ryskopyntestnet",
  [CHAINID.ARBITRUM_MAINNET]: 
    "https://api.thegraph.com/subgraphs/name/rysk-finance/rysk-opyn-gamma-arbitrum",
};

export const SCAN_URL = {
  [CHAINID.LOCALHOST]: "",
  [CHAINID.ETH_MAINNET]: "",
  [CHAINID.ARBITRUM_RINKEBY]: "https://testnet.arbiscan.io",
  [CHAINID.ARBITRUM_MAINNET]: "https://arbiscan.io",
};

/**
 * Tokens and owners
 */
export const WETH_ADDRESS = {
  [CHAINID.ETH_MAINNET]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [CHAINID.ARBITRUM_RINKEBY]: "0xE32513090f05ED2eE5F3c5819C9Cce6d020Fefe7",
  [CHAINID.ARBITRUM_MAINNET]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
};

export const USDC_ADDRESS = {
  [CHAINID.ETH_MAINNET]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  [CHAINID.ARBITRUM_RINKEBY]: "0x3c6c9b6b41b9e0d82fed45d9502edffd5ed3d737",
  [CHAINID.ARBITRUM_MAINNET]: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
};

// export const OPYN_OPTION_REGISTRY = {
//   [CHAINID.ETH_MAINNET]: "",
//   [CHAINID.ARBITRUM_RINKEBY]: "0xA6005cAcF024404d4335751d4dE8c23ff6EC5214",
//   [CHAINID.ARBITRUM_MAINNET]: "0x04706DE6cE851a284b569EBaE2e258225D952368",
// };

// export const LIQUIDITY_POOL = {
//   [CHAINID.ETH_MAINNET]: "",
//   [CHAINID.ARBITRUM_RINKEBY]: "0xA7f49544f51f46E3bA2099A3aCad70502b8bc125",
// };

// export const PRICE_FEED = {
//   [CHAINID.ETH_MAINNET]: "",
//   [CHAINID.ARBITRUM_RINKEBY]: "0xDbBF84a29515C783Ea183f92120be7Aa9120fA23",
// };

// export const PORTFOLIO_VALUES_FEED = {
//   [CHAINID.ETH_MAINNET]: "",
//   [CHAINID.ARBITRUM_RINKEBY]: "0x540932Ac16341384E273bDf888806F001003560B",
// };

// export const USDC_OWNER_ADDRESS = {
//   [CHAINID.ETH_MAINNET]: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503",
// };

// /**
//  * Oracles
//  */
// export const ETH_PRICE_ORACLE = {
//   [CHAINID.ETH_MAINNET]: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
// };

// export const USDC_PRICE_ORACLE = {
//   [CHAINID.ETH_MAINNET]: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
// };

// export const CHAINLINK_WETH_PRICER = {
//   [CHAINID.ETH_MAINNET]: "0x128cE9B4D97A6550905dE7d9Abc2b8C747b0996C", // New ChainLink
// };

// /**
//  * Opyn
//  */
// export const OTOKEN_FACTORY = {
//   [CHAINID.ETH_MAINNET]: "0x7C06792Af1632E77cb27a558Dc0885338F4Bdf8E",
// };

// export const MARGIN_POOL = {
//   [CHAINID.ETH_MAINNET]: "0x5934807cC0654d46755eBd2848840b616256C6Ef",
// };

// export const GAMMA_ORACLE = {
//   [CHAINID.ETH_MAINNET]: "0x789cD7AB3742e23Ce0952F6Bc3Eb3A73A0E08833",
// };

// export const GAMMA_ORACLE_NEW = {
//   [CHAINID.ETH_MAINNET]: "0x789cD7AB3742e23Ce0952F6Bc3Eb3A73A0E08833", // New oracle
// };

// export const GAMMA_WHITELIST = {
//   [CHAINID.ETH_MAINNET]: "0xa5EA18ac6865f315ff5dD9f1a7fb1d41A30a6779",
// };

// export const GAMMA_WHITELIST_OWNER = {
//   [CHAINID.ETH_MAINNET]: "0x638E5DA0EEbbA58c67567bcEb4Ab2dc8D34853FB",
// };

// export const GAMMA_CONTROLLER = {
//   [CHAINID.ETH_MAINNET]: "0x4ccc2339F87F6c59c6893E1A678c2266cA58dC72",
// };

// export const ORACLE_OWNER = {
//   [CHAINID.ETH_MAINNET]: "0x2FCb2fc8dD68c48F406825255B4446EDFbD3e140",
// };

// export const UNISWAP_V3_SWAP_ROUTER = {
//   [CHAINID.ETH_MAINNET]: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
// };

// export const CONTROLLER_OWNER = {
//   [CHAINID.ETH_MAINNET]: "0x638E5DA0EEbbA58c67567bcEb4Ab2dc8D34853FB",
// };

// export const ADDRESS_BOOK_OWNER = {
//   [CHAINID.ETH_MAINNET]: "0x638E5DA0EEbbA58c67567bcEb4Ab2dc8D34853FB",
// };

// export const ADDRESS_BOOK = {
//   [CHAINID.ETH_MAINNET]: "0x1E31F2DCBad4dc572004Eae6355fB18F9615cBe4",
// };

export const ORACLE_DISPUTE_PERIOD = 7200;
export const ORACLE_LOCKING_PERIOD = 300;

export const DHV_NAME = "ryUSDC";
