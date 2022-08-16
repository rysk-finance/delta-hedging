import React from "react";
import { BigNumber } from "ethers";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useWalletContext } from "../../App";
import LPABI from "../../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import { useContract } from "../../hooks/useContract";
import { VaultActionType } from "../../state/types";
import { useVaultContext } from "../../state/VaultContext";

export const VaultStateManagment = () => {
  const { account } = useWalletContext();
  const { dispatch } = useVaultContext();

  const [lpContract] = useContract<{
    DepositEpochExecuted: [];
    WithdrawalEpochExecuted: [];
  }>({
    contract: "liquidityPool",
    ABI: LPABI.abi,
    readOnly: true,
    events: {
      DepositEpochExecuted: async () => {
        toast("✅ The epoch was advanced");
        EpochListener();
      },
      WithdrawalEpochExecuted: async () => {
        toast("✅ The epoch was advanced");
        EpochListener();
      },
    },
    isListening: {
      DepositEpochExecuted: true,
      WithdrawalEpochExecuted: true,
    },
  });

  const getEpochData = useCallback(async () => {
    if (lpContract) {
      const depositEpoch: BigNumber = await lpContract.depositEpoch();
      const withdrawalEpoch: BigNumber = await lpContract.withdrawalEpoch();
      const depositEpochPricePerShare: BigNumber =
        await lpContract.depositEpochPricePerShare(depositEpoch.sub(1));
      const withdrawalEpochPricePerShare: BigNumber =
        await lpContract.depositEpochPricePerShare(withdrawalEpoch.sub(1));
      return {
        depositEpoch,
        withdrawalEpoch,
        depositEpochPricePerShare,
        withdrawalEpochPricePerShare,
      };
    }
  }, [lpContract]);

  const EpochListener = useCallback(async () => {
    const epochData = await getEpochData();
    dispatch({
      type: VaultActionType.SET,
      data: { ...epochData },
    });
  }, [dispatch, getEpochData]);

  const getUserRyskBalance = useCallback(async () => {
    if (lpContract && account) {
      const balance: BigNumber = await lpContract.balanceOf(account);
      return balance;
    }
  }, [lpContract, account]);

  useEffect(() => {
    const getInfo = async () => {
      const epochData = await getEpochData();
      const balance = await getUserRyskBalance();
      if (epochData || balance) {
        dispatch({
          type: VaultActionType.SET,
          data: {
            depositEpoch: epochData?.depositEpoch,
            withdrawalEpoch: epochData?.withdrawalEpoch,
            depositPricePerShare: epochData?.depositEpochPricePerShare,
            withdrawalPricePerShare: epochData?.withdrawalEpochPricePerShare,
            userDHVBalance: balance,
          },
        });
      }
    };

    getInfo();
  }, [dispatch, getEpochData, getUserRyskBalance]);

  return null;
};
