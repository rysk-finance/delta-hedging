import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useWalletContext } from "../App";
import { Settings } from "./dashboard/Settings";
import { Button } from "./shared/Button";

export const HeaderPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { account, disconnect } = useWalletContext();

  const handleClickOutside = (event: MouseEvent) => {
    if (
      isOpenRef.current &&
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center" ref={containerRef}>
      <Button
        type="button"
        onClick={() => setIsOpen((old) => !old)}
        className="flex items-center"
      >
        <img
          src="/arbitrum_logo.svg"
          className="h-4 w-auto mr-2"
          alt="Arbitrum"
        />
        {`${account?.slice(0, 4)}...${account?.slice(
          account.length - 4,
          account.length
        )}`}{" "}
        {isOpen ? "▼" : "▲"}
      </Button>

      {isOpen && (
        <div className="fixed top-[72px] bg-bone border-2 border-black right-16 p-2 min-w-[300px]">
          <div className="flex flex-col">
            <Button
              onClick={() => {
                account && navigator.clipboard.writeText(account);
                toast("Address coppied to clipboard", { autoClose: 1000 });
              }}
              className="mb-[-2px] bg-bone"
            >
              Copy address
            </Button>
            <Button
              onClick={() => {
                account &&
                  window.open(`https://etherscan.io/address/${account}`);
              }}
              className="mb-4"
            >
              Open in Etherscan
            </Button>
            {/* <div className="mb-4">
              <Settings />
            </div> */}
            <Button
              onClick={() => {
                disconnect?.();
              }}
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
