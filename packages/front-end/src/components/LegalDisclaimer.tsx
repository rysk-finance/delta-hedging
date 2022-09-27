import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppPaths } from "../config/appPaths";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Button } from "./shared/Button";
import { Card } from "./shared/Card";

const STORAGE_KEY = "legalAccepted";

const OVERFLOW_HIDDEN_CLASS = "overflow-hidden";

export const LegalDisclaimer = () => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);

  const [isChecked, setIsChecked] = useState(false);

  const [get, set] = useLocalStorage();

  const handleAccept = () => {
    set(STORAGE_KEY, true);
    getIsAccepted();
  };

  const getIsAccepted = useCallback(() => {
    const accepted: boolean | null = get(STORAGE_KEY);

    if (accepted) {
      setIsAccepted(true);
    } else {
      setIsAccepted(false);
    }
  }, [get]);

  useEffect(() => {
    getIsAccepted();
  }, [getIsAccepted]);

  useEffect(() => {
    if (isAccepted !== null) {
      if (isAccepted) {
        document.body.classList.remove(OVERFLOW_HIDDEN_CLASS);
      } else if (!document.body.classList.contains(OVERFLOW_HIDDEN_CLASS)) {
        document.body.classList.add(OVERFLOW_HIDDEN_CLASS);
      }
    }
  }, [isAccepted]);

  return isAccepted === null || isAccepted ? null : (
    <div
      className="fixed h-screen w-screen z-[100] flex justify-center items-center"
      onScroll={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="w-full h-full bg-black opacity-50 absolute top-0 left-0" />
      <div className="w-[480px]">
        <Card
          tabs={[
            {
              label: "Disclaimer",
              content: (
                <div className="bg-bone">
                  <div className="p-8 flex items-start">
                    <div className="mr-4 pt-[2px]">
                      <button
                        className={`w-6 h-6 border-black rounded-md border-2 ${
                          isChecked ? "bg-black" : "bg-transparent"
                        }`}
                        onClick={() => {
                          setIsChecked((old) => !old);
                        }}
                      >
                        <img
                          src="icons/check.svg"
                          className={`w-full h-full transition-all`}
                          style={{ opacity: isChecked ? 1 : 0 }}
                        />
                      </button>
                    </div>
                    <p>
                      You have read and understand, and do hereby agree to the
                      Rysk Alpha User{" "}
                      <Link
                        to={AppPaths.TERMS}
                        className="cursor-pointer text-cyan-dark underline"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and acknowledge that you have read and understand the Rysk
                      Alpha{" "}
                      <Link
                        to={AppPaths.PRIVACY_POLICY}
                        className="cursor-pointer text-cyan-dark underline"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                  <Button
                    className="w-full border-x-0 border-b-0 !py-4"
                    color="black"
                    disabled={!isChecked}
                    onClick={handleAccept}
                  >
                    Accept
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};
