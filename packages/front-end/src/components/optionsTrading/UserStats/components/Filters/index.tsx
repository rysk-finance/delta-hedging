import { useGlobalContext } from "src/state/GlobalContext";
import { ActionType } from "src/state/types";
import { Preferences } from "../../enums";
import { SimpleToggle } from "../../../../shared/SimpleToggle";

export const Filters = () => {
  const {
    dispatch,
    state: {
      userStats: {
        activePositionsFilters: { compact, hideExpired },
      },
    },
  } = useGlobalContext();

  const handleHideExpiredClick = () => {
    const activePositionsFilters = { hideExpired: !hideExpired };

    localStorage.setItem(
      Preferences.ACTIVE_POSITIONS_FILTERS_HIDE_EXPIRED,
      JSON.stringify(activePositionsFilters)
    );

    dispatch({
      type: ActionType.SET_USER_STATS,
      activePositionsFilters,
    });
  };

  const handleCompactClick = () => {
    const activePositionsFilters = { compact: !compact };

    localStorage.setItem(
      Preferences.ACTIVE_POSITIONS_FILTERS_COMPACT,
      JSON.stringify(activePositionsFilters)
    );

    dispatch({
      type: ActionType.SET_USER_STATS,
      activePositionsFilters,
    });
  };

  return (
    <div className="flex justify-end select-none">
      <span
        className="flex items-center cursor-pointer mr-8 py-3"
        onClick={handleCompactClick}
      >
        <SimpleToggle isActive={compact}>{`Compact view:`}</SimpleToggle>
      </span>

      <span
        className="flex items-center cursor-pointer py-3"
        onClick={handleHideExpiredClick}
      >
        <SimpleToggle
          isActive={hideExpired}
        >{`Hide expired positions:`}</SimpleToggle>
      </span>
    </div>
  );
};
