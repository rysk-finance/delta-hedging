import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import ERC20ABI from "../abis/erc20.json";
import { useWalletContext } from "../App";
import LPABI from "../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json";
import { USDC_ADDRESS } from "../config/mainnetContracts";
import addresses from "../contracts.json";
import { useContract } from "../hooks/useContract";
import { RadioButtonSlider } from "./shared/RadioButtonSlider";
import { TextInput } from "./shared/TextInput";

enum Mode {
  DEPOSIT = "Deposit",
  WITHDRAW = "Withdraw",
}

export const VaultDepositWithdraw = () => {
  const { account } = useWalletContext();

  const [mode, setMode] = useState<Mode>(Mode.DEPOSIT);

  const [balance, setBalance] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState("");

  const [lpContract] = useContract({
    address: addresses.localhost.liquidityPool,
    ABI: LPABI.abi,
    readOnly: false,
  });

  const [usdcContract] = useContract({
    address: USDC_ADDRESS,
    ABI: ERC20ABI,
    readOnly: false,
  });

  const getBalance = useCallback(
    async (address: string) => {
      const balance = await lpContract?.balanceOf(address);
      const parsedBalance = ethers.utils.formatUnits(balance, 18);
      setBalance(parsedBalance ?? null);
    },
    [lpContract]
  );

  useEffect(() => {
    (async () => {
      if (account) {
        await getBalance(account);
      }
    })();
  }, [getBalance, account]);

  const handleSubmit = async () => {
    try {
      const amount = ethers.utils.parseUnits(inputValue, 6);
      if (account && amount && lpContract && usdcContract) {
        // USDC is 6 decimals
        const approvalTransaction = await usdcContract.approve(
          addresses.localhost.liquidityPool,
          amount
        );
        console.log(approvalTransaction);
        await approvalTransaction.wait();
        console.log("done!");
        if (mode === Mode.DEPOSIT) {
          const depositTransaction = await lpContract.deposit(amount, account);
          console.log("started deposit transaction");
          await depositTransaction.wait();
          console.log("deposit complete!");
        } else if (mode === Mode.WITHDRAW) {
          const withdrawTransaction = await lpContract.withdraw(
            amount,
            account
          );
          console.log("started withdraw transaction");
          await withdrawTransaction.wait();
          console.log("withdraw complete!");
        }
        await getBalance(account);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-col items-center justify-between h-full">
      <div className="font-parabole">
        <h3 className="pl-4 py-2 border-b-2 border-black">Rysk Vault</h3>
      </div>
      <div className="flex">
        <div className="border-r-2 border-black w-16 flex justify-center items-center">
          <div className="w-7 h-7 rounded-full border-black border-2 flex justify-center items-center">
            <div className="w-4 h-4 rounded-full border-black border-2" />
          </div>
        </div>
        <div className="w-full">
          <div className="w-full">
            <div className="p-4 flex justify-between border-b-2 border-black">
              <h4>Balance:</h4>
              <h4>{balance?.toString()} USDC</h4>
            </div>
            <div className="w-fit">
              <RadioButtonSlider
                selected={mode}
                setSelected={setMode}
                options={[
                  { key: Mode.DEPOSIT, label: "Deposit", value: Mode.DEPOSIT },
                  {
                    key: Mode.WITHDRAW,
                    label: "Withdraw",
                    value: Mode.WITHDRAW,
                  },
                ]}
              />
            </div>
          </div>
          <div className="ml-[-2px]">
            <TextInput
              className="text-right p-4 text-xl"
              setValue={setInputValue}
              value={inputValue}
              iconLeft={
                <div className="h-full flex items-center px-4 text-right text-gray-600">
                  <p>USDC</p>
                </div>
              }
              numericOnly
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => handleSubmit()}
        className="w-full py-6 rounded-b-xl bg-black text-white mt-[-2px]"
      >
        Submit
      </button>
    </div>
  );
};
