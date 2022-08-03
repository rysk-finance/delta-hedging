import { TransactionResponse } from "@ethersproject/abstract-provider";
import * as ethers from "ethers";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useWalletContext } from "../App";
import { TransactionDisplay } from "../components/shared/TransactionDisplay";
import addresses from "../contracts.json";
import { ContractAddresses, ETHNetwork } from "../types";
import { isRPCError, parseError } from "../utils/parseRPCError";

type EventName = string;
type EventData = any[];

type EventHandler<T extends EventData> = (...args: T) => void;

type EventHandlerMap<T extends Record<EventName, EventData>> = {
  [event in keyof T]: EventHandler<T[event]>;
};

type IsListeningMap<T extends Partial<Record<EventName, EventData>>> = {
  [event in keyof T]: boolean;
};

type EventFilterMap<T extends Partial<Record<EventName, EventData>>> = {
  [event in keyof T]: EventData[];
};

type useContractRyskContractArgs<T extends Record<EventName, EventData>> = {
  contract: keyof ContractAddresses;
  ABI: ethers.ContractInterface;
  readOnly?: boolean;
  events?: EventHandlerMap<T>;
  isListening?: IsListeningMap<T>;
  filters?: EventFilterMap<T>;
};

type useContractExternalContractArgs<T extends Record<EventName, EventData>> = {
  contractAddress: string;
  ABI: ethers.ContractInterface;
  readOnly?: boolean;
  events?: EventHandlerMap<T>;
  isListening?: IsListeningMap<T>;
  filters?: EventFilterMap<T>;
};

type useContractArgs<T extends Record<EventName, EventData>> =
  | useContractRyskContractArgs<T>
  | useContractExternalContractArgs<T>;

/**
 *
 * @param args
 *  readOnly - just determines whether to instance contract with provider or signer
 *  events - a map of Event names, to their handler functions. handler functions should
 *           be memoised using useCallback and NOT PASSED INLINE, as we use function references
 *           to determine when to add and remove listeners.
 *  isListening - a map of Event names to whether their handler should be listening or not.
 * @returns
 * [
 *  the contract,
 *  a wrapper around the contract functions that handles async + error handling.
 * ]
 */
export const useContract = <T extends Record<EventName, EventData> = any>(
  args: useContractArgs<T>
) => {
  const [network] = useState(
    process.env.REACT_APP_NETWORK as keyof typeof addresses | undefined
  );

  const { signer, rpcURL } = useWalletContext();

  const [ethersContract, setEthersContract] = useState<ethers.Contract | null>(
    null
  );

  // Store map of function handlers in ref so we can remove and add
  // handlers when required.
  const contractEvents = useRef(args.events);
  // Caching the events with listeners attached so that we don't unneccesarily
  // add and remove event listeners.
  const eventsWithListeners = useRef(new Set());

  const callWithErrorHandling = useCallback(
    async ({
      method,
      args,
      successMessage: successMessage = "✅ Transaction created",
      onComplete,
      onFail,
    }: {
      method: ethers.ContractFunction;
      args: any[];
      successMessage?: string;
      onComplete?: () => void;
      onFail?: () => void;
    }) => {
      try {
        const transaction = (await method(...args)) as TransactionResponse;
        if (process.env.REACT_APP_ENV === "testnet") {
          console.log(`TX HASH: ${transaction.hash}`);
        }
        toast(
          <div>
            <p>{successMessage}</p>
            <p>
              TX Hash:{" "}
              <TransactionDisplay>{transaction.hash}</TransactionDisplay>
            </p>
          </div>,
          { autoClose: false }
        );
        onComplete?.();
        return;
      } catch (err) {
        // Might need to modify this is errors other than RPC errors are being thrown
        // my contract function calls.
        if (isRPCError(err)) {
          toast(`❌ ${parseError(err)}`, {
            autoClose: 5000,
          });
        } else {
          toast(JSON.stringify(err));
        }
        onFail?.();
        return null;
      }
    },
    []
  );

  // Instances the ethers contract in state.
  useEffect(() => {
    if (rpcURL) {
      // If we don't require a signer, we just use a generic RPC provider
      // which doesn't require the user to connect their address.
      const rpcProvider = new ethers.providers.JsonRpcProvider(rpcURL);

      const signerOrProvider = args.readOnly ? rpcProvider : signer;

      if (signerOrProvider && network && !ethersContract) {
        const address =
          "contract" in args
            ? (addresses as Record<ETHNetwork, ContractAddresses>)[network][
                (args as useContractRyskContractArgs<T>).contract
              ]
            : (args as useContractExternalContractArgs<T>).contractAddress;
        setEthersContract(
          new ethers.Contract(address, args.ABI, signerOrProvider)
        );
      }
    }
  }, [args, signer, network, ethersContract, rpcURL]);

  // Update the local events map. The event handlers attached to the contract
  // look up the appropriate handler on this object, meaning we can update the
  // function references freely, without needing the update the handler.
  useEffect(() => {
    if (contractEvents.current) {
      const eventNames = Object.keys(
        contractEvents.current
      ) as (keyof EventHandlerMap<T>)[];

      eventNames.forEach((eventName) => {
        if (contractEvents.current && args.events) {
          contractEvents.current[eventName] = args.events[eventName];
        }
      });
    }
  }, [args.events]);

  // Attaches and removes the handlers as isListening map changes.
  useEffect(() => {
    if (ethersContract && contractEvents.current) {
      const eventNames = Object.keys(
        contractEvents.current
      ) as (keyof EventHandlerMap<T>)[] as string[];

      eventNames.forEach((eventName) => {
        if (contractEvents.current) {
          const handler = contractEvents.current?.[eventName];
          // Attach listener if no isListening argument present, or if that Event isn't in
          // the isListening map, or if it is present and its value is true.
          const shouldAttachListener =
            (!args.isListening || args.isListening[eventName]) &&
            !eventsWithListeners.current.has(eventName);
          // Remove listener only if it's value in the map is false.
          const shouldRemoveListener =
            args.isListening &&
            !args.isListening[eventName] &&
            eventsWithListeners.current.has(eventName);
          if (handler) {
            if (shouldAttachListener) {
              // Here, we're defining an inline function that looks up the appropriate
              // handler on the contractEvents ref. This means we can update the function
              // inside of contractevents, and the updated handler will get called, without
              // us needing to remove then add a new listener.
              // TODO(HC): At the moment, if the inputted filter is updated, the listener
              // won't be, until it is removed and added again by the isListening map.
              // Can update here if this needs to be the case.
              const filter = args.filters
                ? ethersContract.filters[eventName](...args.filters[eventName])
                : eventName;
              ethersContract.on(filter, (...args) => {
                const handler = contractEvents.current?.[eventName];
                // @ts-ignore - unable to tell ethers that this handler
                // takes specific args, and not just any[]
                handler(...args);
              });
            }
            if (shouldRemoveListener) {
              const handlers = ethersContract.listeners(eventName);
              // There should only ever be one. Using forEach just to be safe.
              handlers.forEach((handler) => {
                // @ts-ignore - same as above
                ethersContract.removeListener(eventName, handler);
              });
            }
          }
        }
      });
      const activeEvents = eventNames.filter(
        (eventName) => args.isListening?.[eventName]
      );
      eventsWithListeners.current = new Set(activeEvents);
    }
  }, [ethersContract, contractEvents, args.isListening, args.filters]);

  // Cleanup effect. Remove all contract event listeners.
  useEffect(() => {
    return () => {
      if (ethersContract) {
        ethersContract.removeAllListeners();
      }
    };
  }, [ethersContract]);

  return [ethersContract, callWithErrorHandling] as const;
};
