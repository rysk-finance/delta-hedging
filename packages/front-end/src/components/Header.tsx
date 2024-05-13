import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { Close } from "src/Icons";
import FadeInDown from "src/animation/FadeInDownDelayed";
import { Connect } from "src/clients/WalletProvider/components/Connect";
import { useGlobalContext } from "src/state/GlobalContext";
import {
  LocalStorageKeys,
  setLocalStorageBoolean,
} from "src/state/localStorage";
import { ActionType } from "src/state/types";
import { AppPaths } from "../config/appPaths";

const links = [
  { id: "header-vault", path: AppPaths.VAULT, label: "Vault" },
  { id: "header-dashboard", path: AppPaths.DASHBOARD, label: "Dashboard" },
  { id: "header-rewards", path: AppPaths.REWARDS, label: "Rewards" },
];

export const Header = () => {
  const { pathname } = useLocation();

  const {
    dispatch,
    state: { nativeUSDCBannerVisible },
  } = useGlobalContext();

  const handleClose = () => {
    setLocalStorageBoolean(LocalStorageKeys.NATIVE_USDC_BANNER_VISIBLE, 0);

    dispatch({
      type: ActionType.SET_NATIVE_USDC_BANNER_VISIBLE,
      visible: false,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-bone">
      <nav className="relative flex items-center px-16 justify-between border-b-2 border-black bg-bone z-50">
        <Link to={AppPaths.HOME}>
          <img
            alt="Rysk logo"
            className="h-20 py-4"
            src={"/logo-animated.gif"}
            title="Rysk: Uncorrelated Returns"
          />
        </Link>

        <div className="flex items-center">
          <LayoutGroup>
            <motion.div className="mr-4" layout="position">
              {links.map(({ id, path, label }) => (
                <Link
                  key={path}
                  id={id}
                  to={path}
                  className={`mr-2 border-none bg-transparent p-2 underline-offset-2 ${
                    pathname === path ? "underline" : ""
                  }`}
                >
                  {label}
                </Link>
              ))}
            </motion.div>

            <Connect />
          </LayoutGroup>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {nativeUSDCBannerVisible && (
          <motion.b
            className="relative flex justify-center px-16 border-b-2 border-black"
            {...FadeInDown(0.3)}
          >
            <span className="w-2/3 mx-auto py-3 text-center text-sm lg:text-base">
              {`Rysk Finance is using `}
              <a
                className="text-cyan-dark-compliant underline"
                href="https://www.circle.com/blog/arbitrum-usdc-now-available"
                rel="noopener noreferrer"
                target="_blank"
              >
                {`native USDC.`}
              </a>
              {` To swap your bridged USDC.e, you can `}
              <a
                className="text-cyan-dark-compliant underline"
                href="https://jumper.exchange/?fromChain=42161&fromToken=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&toChain=42161&toToken=0xaf88d065e77c8cc2239327c5edb3a432268e5831"
                rel="noopener noreferrer"
                target="_blank"
              >
                {`click here.`}
              </a>
            </span>

            <button className="p-3" onClick={handleClose}>
              <Close />
            </button>
          </motion.b>
        )}
      </AnimatePresence>
    </header>
  );
};
