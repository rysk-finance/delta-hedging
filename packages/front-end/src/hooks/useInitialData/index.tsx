import type { InitialDataQuery } from "./types";

import { gql, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useGlobalContext } from "src/state/GlobalContext";
import { ActionType } from "src/state/types";
import { getContractAddress } from "src/utils/helpers";
import { logError } from "src/utils/logError";
import { useUpdateEthPrice } from "../useUpdateEthPrice";
import { initialDataQuery } from "./graphQuery";
import { getInitialData } from "./utils";

/**
 * Initialiser hook to pre-fetch:
 * - Ether price data.
 * - Options chain data.
 * - User position data if a wallet is connected.
 *
 * Also sets the error and loading states, as well as
 * a refresh function into global context state for
 * visibility and re-triggering.
 *
 * @returns void
 */
export const useInitialData = () => {
  const { address } = useAccount();

  const [skip, setSkip] = useState(false);

  const {
    state: {
      options: { activeExpiry },
      selectedOption,
    },
    dispatch,
  } = useGlobalContext();

  const { updatePriceData } = useUpdateEthPrice();

  const { data, error, loading } = useQuery<InitialDataQuery>(
    gql(initialDataQuery),
    {
      onError: logError,
      skip: skip,
      variables: {
        address: address?.toLowerCase(),
        now: String(dayjs().unix()),
        underlying: getContractAddress("WETH"),
      },
    }
  );

  const refresh = () => {
    setSkip(false);
  };

  useEffect(() => {
    if (!loading) refresh();
  }, [address, loading]);

  useEffect(() => {
    if (loading) {
      dispatch({
        type: ActionType.SET_OPTIONS,
        loading,
      });
    }

    if (error && !loading) {
      dispatch({
        type: ActionType.SET_OPTIONS,
        error,
        loading,
      });
    }

    if (data && !loading) {
      updatePriceData();

      getInitialData(data, address).then(
        ([
          validExpiries,
          userPositions,
          chainData,
          isOperator,
          userVaults,
          liquidationParameters,
          liquidityPoolInfo,
          oracleHashMap,
        ]) => {
          dispatch({
            type: ActionType.SET_OPTIONS,
            activeExpiry: activeExpiry || validExpiries[0],
            data: chainData,
            error,
            expiries: validExpiries,
            isOperator,
            liquidityPool: liquidityPoolInfo,
            loading,
            refresh,
            spotShock: liquidationParameters.spotShock,
            timesToExpiry: liquidationParameters.timesToExpiry,
            userPositions,
            vaults: userVaults,
            wethOracleHashMap: oracleHashMap,
          });

          if (activeExpiry && selectedOption) {
            const strike = selectedOption.strikeOptions.strike;
            const newStrikeOptions = chainData[activeExpiry][strike];
            const option = {
              ...selectedOption,
              strikeOptions: newStrikeOptions,
            };

            dispatch({ type: ActionType.SET_SELECTED_OPTION, option });
          }
        }
      );

      setSkip(true);
    }
  }, [data, error, loading, skip]);

  return null;
};
