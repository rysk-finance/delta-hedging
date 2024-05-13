import { useEffect } from "react";
import { useAccount } from "wagmi";

import { Card } from "../../components/shared/Card";
import { DHV_NAME } from "../../config/constants";
import { useUserPosition } from "../../hooks/useUserPosition";
import { VaultWithdraw } from "./VaultWithdraw";

export const VaultContent = () => {
  const { address } = useAccount();

  const { updatePosition } = useUserPosition();

  useEffect(() => {
    if (address) {
      updatePosition(address);
    }
  }, [address, updatePosition]);

  return (
    <>
      <div className="col-start-1 col-end-8 pt-16">
        <div className="font-parabole mb-8">
          <h4 className="pb-4 text-xl">Dynamic Hedging Vault</h4>
          <h1 className="text-4xl">{DHV_NAME}</h1>
        </div>

        <p className="mt-8">
          The {DHV_NAME} has now been sunset. From <b>May 10th 2024</b>, there
          will be no more options that can be traded, and liquidity providers
          are advised to withdraw from the DHV.
        </p>

        <p className="mt-4">
          We are sad to close Rysk Beyond and the DHV, but we couldn’t be more
          excited for what comes next.{" "}
          <a
            href="https://medium.rysk.finance/introducing-rysk-v2-cb13a5d7733a"
            rel="noopener noreferrer"
          >
            We are building Rysk V2
          </a>{" "}
          to offer a 100x better experience, and we want you to join us on this
          new chapter. Let’s make history together.
        </p>
      </div>

      <div className="col-start-9 col-end-17 pt-16">
        <Card tabs={[{ label: "Withdraw", content: <VaultWithdraw /> }]} />
      </div>
    </>
  );
};
