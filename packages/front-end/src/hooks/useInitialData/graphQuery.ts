import { QueriesEnum } from "src/clients/Apollo/Queries";

export const initialDataQuery = `
query ${QueriesEnum.INITIAL_DATA} ($address: String, $now: String) {
  longPositions(
    where: { account: $address, active: true, oToken_: { expiryTimestamp_gte: $now } }
  ) {
    netAmount
    oToken {
      createdAt
      expiryTimestamp
      id
      isPut
      strikePrice
      symbol
    }
    optionsBoughtTransactions {
      fee
      premium
    }
    optionsSoldTransactions {
      fee
      premium
    }
  }
  
    shortPositions(
    where: { account: $address, active: true, oToken_: { expiryTimestamp_gte: $now } }
  ) {
    netAmount
    oToken {
      createdAt
      expiryTimestamp
      id
      isPut
      strikePrice
      symbol
    }
    optionsBoughtTransactions {
      fee
      premium
    }
    optionsSoldTransactions {
      fee
      premium
    }
    vault {
      id
      vaultId
      collateralAmount
      shortAmount
      collateralAsset {
        id
      } 
    }
  }
}
`;
