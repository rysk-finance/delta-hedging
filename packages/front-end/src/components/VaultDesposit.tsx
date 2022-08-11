import React from "react";
import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ERC20ABI from "../abis/erc20.json";
import { useWalletContext } from "../App";
import LPABI from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import {
  BIG_NUMBER_DECIMALS,
  DECIMALS,
  MAX_UINT_256,
  ZERO_UINT_256,
} from "../config/constants";
import addresses from "../contracts.json";
import { useContract } from "../hooks/useContract";
import { useGlobalContext } from "../state/GlobalContext";
import {
  ContractAddresses,
  Currency,
  DepositReceipt,
  ETHNetwork,
  Events,
} from "../types";
import { RequiresWalletConnection } from "./RequiresWalletConnection";
import { Button } from "./shared/Button";
import { TextInput } from "./shared/TextInput";
import { BigNumberDisplay } from "./BigNumberDisplay";
import { RyskTooltip } from "./RyskTooltip";

enum DepositMode {
  USDC = "USDC",
  REDEEM = "Redeem",
}

export const VaultDeposit = () => {
  const { account, network } = useWalletContext();

  const {
    state: { settings },
  } = useGlobalContext();

  // UI State
  const [depositMode, setDepositMode] = useState<DepositMode>(DepositMode.USDC);
  const [inputValue, setInputValue] = useState("");
  const [listeningForApproval, setListeningForApproval] = useState(false);
  const [listeningForDeposit, setListeningForDeposit] = useState(false);
  const [listeningForRedeem, setListeningForRedeem] = useState(false);

  // Chain state
  const [epoch, setCurrentEpoch] = useState<BigNumber | null>(null);
  const [currentEpochSharePrice, setCurrentEpochSharePrice] =
    useState<BigNumber | null>(null);
  const [userUSDCBalance, setUserUSDCBalance] = useState<BigNumber | null>(
    null
  );
  const [depositReceipt, setDepositReceipt] = useState<DepositReceipt | null>(
    null
  );
  const [pendingDepositedUSDC, setPendingDepositedUSDC] =
    useState<BigNumber | null>(null);
  const [unredeemedShares, setUnredeemedShares] = useState<BigNumber | null>(
    null
  );
  const [redeemedSharesUSDC, setRedeemedSharesUSDC] =
    useState<BigNumber | null>(null);
  const [approvalState, setApprovalState] = useState<Events["Approval"] | null>(
    null
  );

  // Contracts
  const [lpContract, lpContractCall] = useContract<{
    EpochExecuted: [];
    Deposit: [BigNumber, BigNumber, BigNumber];
    Redeem: [];
  }>({
    contract: "liquidityPool",
    ABI: LPABI.abi,
    readOnly: false,
    events: {
      EpochExecuted: () => {
        // TODO: Update copy here
        toast("✅ The epoch was advanced");
        epochListener();
      },
      Deposit: () => {
        setListeningForDeposit(false);
        toast("✅ Deposit complete");
        updateDepositState();
      },
      Redeem: () => {
        setListeningForRedeem(false);
        toast("✅ Redeem completed");
        updateDepositState();
      },
    },
    isListening: {
      EpochExecuted: true,
      Deposit: listeningForDeposit,
      Redeem: listeningForRedeem,
    },
  });

  const [usdcContract, usdcContractCall] = useContract<{
    Approval: [string, string, BigNumber];
  }>({
    contract: "USDC",
    ABI: ERC20ABI,
    readOnly: false,
    events: {
      Approval: (owner, spender, value) => {
        setApprovalState({ owner, spender, value });
        setListeningForApproval(false);
        toast("✅ Approval complete");
      },
    },
    isListening: { Approval: listeningForApproval },
  });

  const getUSDCBalance = useCallback(
    async (address: string) => {
      const balance = await usdcContract?.balanceOf(address);
      setUserUSDCBalance(balance);
      return balance;
    },
    [usdcContract]
  );

  const getCurrentEpoch = useCallback(async () => {
    const currentEpoch: BigNumber = await lpContract?.epoch();
    setCurrentEpoch(currentEpoch);
    return currentEpoch;
  }, [lpContract]);

  const getCurrentSharePrice = useCallback(
    async (epoch: BigNumber) => {
      const currentEpochSharePrice: BigNumber =
        await lpContract?.epochPricePerShare(epoch.sub(1));
      setCurrentEpochSharePrice(currentEpochSharePrice);
      return currentEpochSharePrice;
    },
    [lpContract]
  );

  const getRedeemedSharesUSDC = useCallback(
    async (address: string, epochPricePerShare: BigNumber) => {
      const sharesBalance: BigNumber | null = await lpContract?.balanceOf(
        address
      );
      const sharesBalanceUSDCValue = sharesBalance?.div(
        epochPricePerShare.div(BIG_NUMBER_DECIMALS.RYSK)
      );
      setRedeemedSharesUSDC(sharesBalanceUSDCValue ?? null);
      return sharesBalance;
    },
    [lpContract]
  );

  const getDepositReceipt = useCallback(
    async (address: string) => {
      const depositReceipt: DepositReceipt = await lpContract?.depositReceipts(
        address
      );
      setDepositReceipt(depositReceipt);
      return depositReceipt;
    },
    [lpContract]
  );

  const getPendingDepositedUSDC = useCallback(
    async (depositReceipt: DepositReceipt, currentEpoch: BigNumber) => {
      const isPendingUSDC = depositReceipt.epoch.eq(currentEpoch);
      if (isPendingUSDC) {
        setPendingDepositedUSDC(depositReceipt.amount);
      } else {
        setPendingDepositedUSDC(BigNumber.from(0));
      }
    },
    []
  );

  const getUnredeemedShares = useCallback(
    (
      depositReceipt: DepositReceipt,
      currentEpochSharePrice: BigNumber,
      currentEpoch: BigNumber
    ) => {
      const receiptEpochHasRun = depositReceipt.epoch.lt(currentEpoch);
      // When making conversion from amount (USDC) to RYSK, need to
      // account for decimals. Hence scaling by BIG_NUMBER_DECIMALS values.
      const receiptAmountInShares = receiptEpochHasRun
        ? depositReceipt.amount
            // Making e24
            .mul(BIG_NUMBER_DECIMALS.RYSK)
            // Now e6
            .div(currentEpochSharePrice)
            // Now back to e18
            .mul(BIG_NUMBER_DECIMALS.RYSK.div(BIG_NUMBER_DECIMALS.USDC))
        : BigNumber.from(0);
      const totalRedeemableShares = receiptAmountInShares.add(
        depositReceipt.unredeemedShares
      );
      setUnredeemedShares(totalRedeemableShares);
    },
    []
  );

  const updateDepositState = useCallback(async () => {
    if (account) {
      await getUSDCBalance(account);
      const currentEpoch = await getCurrentEpoch();
      const currentEpochSharePrice = await getCurrentSharePrice(currentEpoch);
      const depositReceipt = await getDepositReceipt(account);
      await getRedeemedSharesUSDC(account, currentEpochSharePrice);
      await getUnredeemedShares(
        depositReceipt,
        currentEpochSharePrice,
        currentEpoch
      );
      await getPendingDepositedUSDC(depositReceipt, currentEpoch);
    }
  }, [
    account,
    getCurrentEpoch,
    getCurrentSharePrice,
    getDepositReceipt,
    getRedeemedSharesUSDC,
    getPendingDepositedUSDC,
    getUSDCBalance,
    getUnredeemedShares,
  ]);

  const epochListener = useCallback(async () => {
    updateDepositState();
  }, [updateDepositState]);

  useEffect(() => {
    (async () => {
      await updateDepositState();
    })();
  }, [updateDepositState]);

  // Reset input value when switching mode
  useEffect(() => {
    setInputValue("");
  }, [depositMode]);

  // UI Handlers
  const handleInputChange = (value: string) => {
    setInputValue(value);
    setApprovalState(null);
  };

  // Handlers for the different possible vault interactions.
  const handleApproveSpend = async () => {
    if (usdcContract && network) {
      const amount = BIG_NUMBER_DECIMALS.RYSK.mul(BigNumber.from(inputValue));
      const approvedAmount = (await usdcContract.allowance(
        account,
        (addresses as Record<ETHNetwork, ContractAddresses>)[network.name][
          "liquidityPool"
        ]
      )) as BigNumber;
      try {
        if (!settings.unlimitedApproval || approvedAmount.lt(amount)) {
          await usdcContractCall({
            method: usdcContract.approve,
            args: [
              (addresses as Record<ETHNetwork, ContractAddresses>)[
                network.name
              ]["liquidityPool"],
              settings.unlimitedApproval
                ? ethers.BigNumber.from(MAX_UINT_256)
                : amount,
            ],
            successMessage: "✅ Approval submitted",
          });
          setListeningForApproval(true);
        } else {
          toast("✅ Your transaction is already approved");
        }
      } catch {
        toast("❌ There was an error approving your transaction.");
        setListeningForApproval(false);
      }
    }
  };

  const handleDepositCollateral = async () => {
    if (usdcContract && lpContract && account && network) {
      const amount = ethers.utils.parseUnits(inputValue, DECIMALS.USDC);
      await lpContractCall({
        method: lpContract.deposit,
        args: [amount],
        successMessage: "✅ Deposit submitted",
        onComplete: () => {
          setApprovalState(null);
        },
      });
      setListeningForDeposit(true);
    }
  };

  const handleRedeemShares = async () => {
    if (lpContract) {
      await lpContractCall({ method: lpContract.redeem, args: [MAX_UINT_256] });
      setListeningForRedeem(true);
    }
  };

  // Coordinate the interactions on submit
  const handleSubmit = async () => {
    try {
      if (account && lpContract && usdcContract) {
        if (depositMode === DepositMode.USDC) {
          await handleDepositCollateral();
        } else if (depositMode === DepositMode.REDEEM) {
          await handleRedeemShares();
        }
        await updateDepositState();
        setInputValue("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveIsDisabled =
    !inputValue || !!approvalState || listeningForApproval;
  const depositIsDisabled =
    depositMode === DepositMode.USDC &&
    !(inputValue && account && approvalState);
  const redeemIsDisabled = listeningForRedeem;

  return (
    <div className="flex-col items-center justify-between h-full">
      <div className="w-full h-8 bg-black text-white px-2 flex items-center justify-start">
        <p>
          <b>1. Deposit USDC</b>
        </p>
      </div>
      <div className="flex border-b-2 border-black">
        <div className="border-r-2 border-black w-16 flex justify-center items-center">
          <div className="w-7 h-7 rounded-full border-black border-2 flex justify-center items-center">
            <div className="w-4 h-4 rounded-full border-black border-2" />
          </div>
        </div>
        <div className="w-full">
          <div className="w-full">
            <div className="p-2 text-right">
              <p className="text-xs">
                Balance:{" "}
                <RequiresWalletConnection className="w-[60px] h-[16px] mr-2 translate-y-[-2px]">
                  <BigNumberDisplay currency={Currency.USDC}>
                    {userUSDCBalance}
                  </BigNumberDisplay>
                </RequiresWalletConnection>{" "}
                USDC
              </p>
            </div>
          </div>
          <div className="ml-[-2px]">
            <TextInput
              className="text-right p-4 text-xl border-r-0"
              setValue={handleInputChange}
              value={inputValue}
              iconLeft={
                <div className="h-full flex items-center px-4 text-right text-gray-600">
                  <p>{depositMode === DepositMode.USDC ? "USDC" : "Shares"}</p>
                </div>
              }
              numericOnly
            />
          </div>
          <div className="ml-[-2px] px-2 py-4 border-b-[2px] border-black text-[16px]">
            <div className="flex justify-between">
              <div className="flex">
                <p>Pending USDC</p>
                <RyskTooltip
                  message={
                    "Your USDC will be deployed to our vault and converted to shares every Friday at 11am UTC"
                  }
                  id={"strategeyTip"}
                />
              </div>
              <p>
                <RequiresWalletConnection className="translate-y-[-6px] w-[80px] h-[12px]">
                  <BigNumberDisplay currency={Currency.USDC}>
                    {pendingDepositedUSDC}
                  </BigNumberDisplay>
                </RequiresWalletConnection>{" "}
                USDC
              </p>
            </div>
          </div>
          <div className="flex">
            <>
              <Button
                onClick={handleApproveSpend}
                className={`w-full !py-6 !border-0 bg-black text-white`}
                disabled={approveIsDisabled}
                color="black"
              >
                {approvalState
                  ? "✅ Approved"
                  : listeningForApproval
                  ? "⏱ Awaiting Approval"
                  : "Approve"}
              </Button>
              <Button
                onClick={() => {
                  if (inputValue) {
                    handleSubmit();
                  }
                }}
                className={`w-full !py-6 !border-0 bg-black text-white ${
                  depositIsDisabled ? "!bg-gray-300" : ""
                }`}
                disabled={depositIsDisabled}
                color="black"
              >
                {listeningForDeposit ? "⏱ Awaiting deposit" : "Deposit"}
              </Button>
            </>
          </div>
        </div>
      </div>
      <div>
        <div className="h-4" />
        <div className="w-full h-8 bg-black text-white px-2 flex items-center justify-start">
          <p>
            <b>2. Redeem</b>
          </p>
        </div>
        <div>
          <div>
            {unredeemedShares ? (
              unredeemedShares._hex !== ZERO_UINT_256 ? (
                <>
                  <div className="px-2 py-4">
                    <div className="flex justify-between">
                      <p>Unredeemed Shares</p>
                      <p>
                        <RequiresWalletConnection className="translate-y-[-6px] w-[80px] h-[12px]">
                          <BigNumberDisplay currency={Currency.RYSK}>
                            {unredeemedShares}
                          </BigNumberDisplay>
                        </RequiresWalletConnection>{" "}
                        RYSK
                      </p>
                    </div>
                    <hr className="border-black mb-2 mt-1" />
                    <div className="text-xs text-right">
                      <p>100 RYSK @ 20.12 USDC per RYSK</p>
                      <p>1000 RYSK @ 18.23 USDC per RYSK</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      handleRedeemShares();
                    }}
                    className={`w-full !py-6 border-t-[2px] border-black bg-black text-white`}
                    disabled={redeemIsDisabled}
                    color="black"
                  >
                    {redeemIsDisabled ? "⏱ Awaiting redeem" : "Redeem"}
                  </Button>
                </>
              ) : (
                <p className="text-xs p-2">
                  Your USDC will be available to redeem as shares during our
                  weekly strategy every Friday at 11am UTC
                </p>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
