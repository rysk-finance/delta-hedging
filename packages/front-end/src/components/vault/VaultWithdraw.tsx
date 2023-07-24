import { BigNumber, ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import ReactSlider from "react-slider";
import { useAccount, useNetwork } from "wagmi";

import LPABI from "../../abis/LiquidityPool.json";
import ERC20ABI from "../../abis/erc20.json";
import {
  BIG_NUMBER_DECIMALS,
  DECIMALS,
  ZERO_UINT_256,
} from "../../config/constants";
import {
  WITHDRAW_COMPLETE,
  WITHDRAW_ESTIMATE_MESSAGE,
  WITHDRAW_SHARES_EPOCH,
} from "../../config/messages";
import { useContract } from "../../hooks/useContract";
import { useUserPosition } from "../../hooks/useUserPosition";
import { useVaultContext } from "../../state/VaultContext";
import { Currency, WithdrawalReceipt } from "../../types";
import { BigNumberDisplay } from "../BigNumberDisplay";
import { Loader } from "../Loader";
import { Button } from "../shared/Button";
import { RyskTooltip } from "../shared/RyskToolTip";
import { TextInput } from "../shared/TextInput";
import { PositionTooltip } from "./PositionTooltip";

export const VaultWithdraw = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const {
    state: {
      depositEpoch: currentEpoch,
      withdrawPricePerShare: currentPricePerShare,
    },
  } = useVaultContext();

  const {
    updatePosition,
    userPositionValue,
    positionBreakdown: { unredeemedShares, redeemedShares },
  } = useUserPosition();

  // UI State
  const [sliderPercentage, setSlidePercentage] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState("");
  const [listeningForInitiation, setListeningForInitiation] = useState(false);
  const [listeningForCompleteWithdraw, setListeningForCompleteWithdraw] =
    useState(false);
  const [withdrawEpochComplete, setWithdrawEpochComplete] = useState(false);
  const [withdrawableUSDC, setWithdrawableUSDC] = useState<BigNumber | null>(
    null
  );

  // Chain state
  const [withdrawReceipt, setWithdrawReceipt] =
    useState<WithdrawalReceipt | null>(null);

  // Contracts
  const [lpContract, lpContractCall] = useContract<{
    WithdrawalEpochExecuted: [];
  }>({
    contract: "liquidityPool",
    ABI: LPABI,
    readOnly: false,
  });

  const [usdcContract, usdcContractCall] = useContract({
    contract: "USDC",
    ABI: ERC20ABI,
    readOnly: false,
  });

  const withdrawableDHV = useMemo(
    () =>
      redeemedShares &&
      unredeemedShares &&
      redeemedShares?.add(unredeemedShares),
    [redeemedShares, unredeemedShares]
  );

  const getWithdrawalReceipt = useCallback(
    async (address: string) => {
      const withdrawalReceipt: WithdrawalReceipt =
        await lpContract?.withdrawalReceipts(address);
      setWithdrawReceipt(withdrawalReceipt);
      return withdrawalReceipt;
    },
    [lpContract]
  );

  const updateWithdrawState = useCallback(async () => {
    if (address && currentEpoch && lpContract) {
      const receipt = await getWithdrawalReceipt(address);
      setWithdrawReceipt(receipt);
      const isReceipt = receipt.shares._hex !== ZERO_UINT_256;
      if (isReceipt) {
        if (
          currentEpoch.gt(receipt.epoch) &&
          receipt.shares._hex !== ZERO_UINT_256
        ) {
          setWithdrawEpochComplete(true);
          const receiptEpochSharePrice: BigNumber =
            await lpContract.withdrawalEpochPricePerShare(receipt.epoch);
          // e18
          const usdcValue = receipt.shares
            // e36
            .mul(receiptEpochSharePrice)
            // e18
            .div(BIG_NUMBER_DECIMALS.RYSK)
            // e6
            .div(BIG_NUMBER_DECIMALS.RYSK.div(BIG_NUMBER_DECIMALS.USDC));
          setWithdrawableUSDC(usdcValue);
        }
      } else {
        setWithdrawEpochComplete(false);
        setWithdrawReceipt(receipt);
        setWithdrawableUSDC(null);
      }
    }
  }, [address, currentEpoch, getWithdrawalReceipt, lpContract]);

  useEffect(() => {
    (async () => {
      await updateWithdrawState();
    })();
  }, [updateWithdrawState]);

  const handleSliderChange = useCallback(
    (value: number) => {
      setSlidePercentage(value);
      if (redeemedShares && unredeemedShares && currentPricePerShare) {
        const withdrawValue = ethers.utils.formatUnits(
          redeemedShares
            .add(unredeemedShares)
            .mul(currentPricePerShare)
            .div(BIG_NUMBER_DECIMALS.RYSK)
            .div(BIG_NUMBER_DECIMALS.RYSK.div(BIG_NUMBER_DECIMALS.USDC))
            .mul(value)
            .div(100),
          DECIMALS.USDC
        );
        // Rounded down because ethers BigNumber doesn't do any rounding,
        // just truncates numbers.
        const twoDPValue = (
          Math.floor(Number(withdrawValue) * 100) / 100
        ).toFixed(2);
        setWithdrawValue(twoDPValue);
      }
    },
    [redeemedShares, unredeemedShares, currentPricePerShare]
  );

  const handleInitiateWithdraw = async () => {
    if (usdcContract && lpContract && address && chain && withdrawableDHV) {
      const amount = withdrawableDHV.mul(sliderPercentage).div(100);
      await lpContractCall({
        method: lpContract.initiateWithdraw,
        args: [amount],
        scaleGasLimit: true,
        methodName: "initiateWithdraw",
        submitMessage: "✅ Withdraw initiation submitted",
        onSubmit: () => {
          setListeningForInitiation(true);
        },
        completeMessage:
          "✅ Your withdraw was initiated. You will be able to complete it when this epoch is executed.",

        onComplete: () => {
          setListeningForInitiation(false);
          if (address) {
            updatePosition(address);
          }
          updateWithdrawState();
          updatePosition(address);
          setWithdrawValue("");
        },
      });
    }
  };

  const handleCompleteWithdraw = async () => {
    if (lpContract) {
      await lpContractCall({
        method: lpContract.completeWithdraw,
        args: [],
        scaleGasLimit: true,
        methodName: "completeWithdraw",
        submitMessage: "✅ Withdraw completion submitted",
        onSubmit: () => {
          setListeningForCompleteWithdraw(true);
        },
        completeMessage: "✅ Your withdraw was completed.",
        onComplete: () => {
          setListeningForCompleteWithdraw(false);
          updateWithdrawState();
          if (address) {
            updatePosition(address);
          }
        },
      });
    }
  };

  useEffect(() => {
    if (withdrawableDHV) {
      handleSliderChange(0);
    }
  }, [withdrawableDHV, handleSliderChange]);

  const initiatedIsDisabled =
    !(withdrawValue && address) ||
    listeningForInitiation ||
    ethers.utils.parseUnits(withdrawValue)._hex === ZERO_UINT_256;
  const completeIsDisabled = listeningForCompleteWithdraw;

  return (
    <div className="flex-col items-center justify-between h-full">
      <div className="p-2 bg-black text-white mb-2">
        <p className="text-right font-medium text-lg">
          {isConnected ? (
            <>
              {`Your Position: `}
              <BigNumberDisplay
                currency={Currency.USDC}
                suffix="USDC"
                loaderProps={{
                  className: "h-4 w-auto translate-y-[-2px]",
                }}
              >
                {userPositionValue}
              </BigNumberDisplay>
              <PositionTooltip />
            </>
          ) : (
            <Button
              color="black"
              requiresConnection
            >{`Click to connect`}</Button>
          )}
        </p>
      </div>
      <div className="w-full h-8 bg-black text-white px-2 flex items-center justify-start">
        <p>
          <b>1. Initiate</b>
        </p>
      </div>
      <div className="flex border-b-2 border-black">
        <div className="border-r-2 border-black w-16 flex justify-center items-center">
          <div className="w-7 h-7 rounded-full border-black border-2 flex justify-center items-center">
            <div className="w-4 h-4 rounded-full border-black border-2" />
          </div>
        </div>
        {withdrawEpochComplete ? (
          <div className="p-2">
            <p className="text-xs">
              You must complete your withdrawal from the previous epoch before
              initiating another withdrawal.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full border-black">
              <div className="p-2 text-right">
                <p className="text-xs">
                  {isConnected ? (
                    <>
                      {`Current Vault Balance: `}
                      {currentPricePerShare ? (
                        <BigNumberDisplay currency={Currency.USDC}>
                          {redeemedShares && unredeemedShares
                            ? redeemedShares
                                ?.add(unredeemedShares)
                                .mul(currentPricePerShare)
                                .div(BIG_NUMBER_DECIMALS.RYSK)
                                .div(
                                  BIG_NUMBER_DECIMALS.RYSK.div(
                                    BIG_NUMBER_DECIMALS.USDC
                                  )
                                )
                            : null}
                        </BigNumberDisplay>
                      ) : (
                        <Loader className="h-2" />
                      )}
                      {` USDC`}
                    </>
                  ) : (
                    <>{`Please connect a wallet to see your balance.`}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex border-y-2 border-black bg-white">
              <div className="ml-[-2px] py-2 px-4 h-16 border-l-2 border-black pt-4 w-full">
                <ReactSlider
                  className="horizontal-slider"
                  value={sliderPercentage}
                  onChange={handleSliderChange}
                  renderTrack={(
                    { className: trackClassName, ...trackProps },
                    { index, value }
                  ) => {
                    return (
                      <div
                        className={`${
                          index === 0 &&
                          "bg-black h-1 w-full rounded-full translate-y-[6px]"
                        } ${trackClassName}`}
                        {...trackProps}
                      ></div>
                    );
                  }}
                  marks
                  renderThumb={({
                    className: thumbClassName,
                    ...thumbProps
                  }) => (
                    <div className="items-center">
                      <div
                        {...thumbProps}
                        className={`${thumbClassName} p-2 flex items-center justify-center bg-cyan-dark rounded-full border-2 border-black translate-y-[-1px] cursor-pointer`}
                      ></div>
                    </div>
                  )}
                />
                <div className="w-full flex justify-between items-center mt-5 text-xs">
                  <p
                    className="w-0 translate-x-[-50%] cursor-pointer"
                    onClick={() => handleSliderChange(0)}
                  >
                    0%
                  </p>
                  <p
                    className="w-0 translate-x-[-4px] cursor-pointer"
                    onClick={() => handleSliderChange(25)}
                  >
                    25%
                  </p>
                  <p
                    className="w-0 translate-x-[-8px] cursor-pointer"
                    onClick={() => handleSliderChange(50)}
                  >
                    50%
                  </p>
                  <p
                    className="w-0 translate-x-[-16px] cursor-pointer"
                    onClick={() => handleSliderChange(75)}
                  >
                    75%
                  </p>
                  <p
                    className="w-0 translate-x-[-22px] cursor-pointer"
                    onClick={() => handleSliderChange(100)}
                  >
                    100%
                  </p>
                </div>
              </div>
              <div className="ml-[-2px] w-[120px] border-black border-l-2">
                <TextInput
                  className="pl-[36px] p-4 text-xl border-0"
                  setValue={(value) => {
                    try {
                      if (Number(value) <= 100) {
                        handleSliderChange(Number(value));
                      }
                    } catch {
                      //
                    }
                  }}
                  value={sliderPercentage.toString()}
                  iconLeft={
                    <div className="h-full flex items-center px-4 text-right text-cyan-dark cursor-default">
                      <p>%</p>
                    </div>
                  }
                  maxLength={3}
                  numericOnly
                />
              </div>
            </div>
            <div className="ml-[-2px]">
              <div className="p-4 border-b-2 border-black">
                <div className="flex justify-between items-center">
                  <p className="text-[16px] mr-2">
                    {`Estimated withdrawal amount`}
                    <RyskTooltip content={WITHDRAW_ESTIMATE_MESSAGE} />
                  </p>
                  <p>
                    {isConnected ? (
                      <>
                        {withdrawValue ? (
                          <NumberFormat
                            value={withdrawValue}
                            displayType={"text"}
                            thousandSeparator={true}
                            fixedDecimalScale
                            suffix=" USDC"
                          />
                        ) : (
                          <Loader className="h-6 ml-2" />
                        )}
                      </>
                    ) : (
                      <>{`Please connect a wallet.`}</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex">
              <>
                <Button
                  onClick={() => {
                    if (withdrawValue) {
                      handleInitiateWithdraw();
                    }
                  }}
                  className={`w-full !py-6 !border-0 text-white ${
                    initiatedIsDisabled ? "!bg-gray-300" : ""
                  }`}
                  disabled={initiatedIsDisabled}
                  color="black"
                  requiresConnection
                >
                  {listeningForInitiation
                    ? "⏱ Awaiting initiation"
                    : "Initiate"}
                </Button>
              </>
            </div>
          </div>
        )}
      </div>

      {!withdrawEpochComplete &&
        withdrawReceipt &&
        withdrawReceipt.shares._hex !== ZERO_UINT_256 && (
          <div>
            <div className="ml-[-2px] px-2 py-4 border-b-[2px] border-black text-[16px]">
              <div className="flex justify-between items-center">
                <div className="flex">
                  <p>Withdraw on hold</p>
                  <RyskTooltip content={WITHDRAW_SHARES_EPOCH} />
                </div>

                <div className="h-4 flex items-center">
                  {listeningForInitiation && (
                    <Loader className="mr-2 !h-[24px]" />
                  )}
                  <p>
                    {isConnected ? (
                      <>
                        <BigNumberDisplay currency={Currency.USDC}>
                          {(withdrawReceipt &&
                            currentPricePerShare &&
                            withdrawReceipt?.shares
                              .mul(currentPricePerShare)
                              .div(BIG_NUMBER_DECIMALS.RYSK)
                              .div(
                                BIG_NUMBER_DECIMALS.RYSK.div(
                                  BIG_NUMBER_DECIMALS.USDC
                                )
                              )) ??
                            null}
                        </BigNumberDisplay>
                        {` USDC`}
                      </>
                    ) : (
                      <>{`Please connect a wallet.`}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      <div>
        <div className="h-4" />
        <div className="w-full h-8 bg-black text-white px-2 flex items-center justify-start">
          <p>
            <b>2. Complete</b>
          </p>
        </div>
        {withdrawEpochComplete ? (
          <div>
            <div>
              <div className="px-2 py-4">
                <div className="flex justify-between">
                  <p>Amount available to withdraw</p>
                  <p>
                    {isConnected ? (
                      <>
                        <BigNumberDisplay currency={Currency.USDC}>
                          {withdrawableUSDC}
                        </BigNumberDisplay>
                        {` USDC`}
                      </>
                    ) : (
                      <>{`Please connect a wallet.`}</>
                    )}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  handleCompleteWithdraw();
                }}
                className={`w-full !py-6 !border-b-0 !border-x-0 border-t-[2px] border-black bg-black text-white`}
                disabled={completeIsDisabled}
                color="black"
                requiresConnection
              >
                {completeIsDisabled
                  ? "⏱ Awaiting complete"
                  : "Complete Withdraw"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <p className="text-xs">{WITHDRAW_COMPLETE}</p>
          </div>
        )}
      </div>
    </div>
  );
};
