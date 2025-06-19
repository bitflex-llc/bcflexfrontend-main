import { ActionType } from './actionTypes';
import { IState } from './types';

// ====================================================================================
// TYPES
// ====================================================================================

interface BaseAction {
  type: ActionType;
  payload?: any;
}

interface SetMarketInfoAction {
  type: ActionType.SET_MARKET_INFO;
  currentPairId: string;
  currentMarket: string;
  currentPair: string;
}

interface FetchMarketOrdersAction {
  type: ActionType.FETCH_MARKET_ORDERS;
  payload: {
    buy: any[];
    sell: any[];
  };
}

interface UpdateMarketOrdersAction {
  type: ActionType.UPDATE_MARKET_ORDERS;
  payload: {
    bidOrders: any[];
    askOrders: any[];
  };
}

type Action = BaseAction | SetMarketInfoAction | FetchMarketOrdersAction | UpdateMarketOrdersAction;

// ====================================================================================
// REDUCER HELPERS
// ====================================================================================

const updateState = <T extends keyof IState>(state: IState, key: T, value: IState[T]): IState => ({
  ...state,
  [key]: value
});

const updateMultipleState = (state: IState, updates: Partial<IState>): IState => ({
  ...state,
  ...updates
});

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
  }
};

// ====================================================================================
// ACTION HANDLERS
// ====================================================================================

const actionHandlers: Record<ActionType, (state: IState, action: any) => IState> = {
  [ActionType.FETCH_TICKERS]: (state, action) => updateState(state, 'tickers', action.payload),

  [ActionType.FETCH_CURRENCIES]: (state, action) => updateState(state, 'currencies', action.payload),

  [ActionType.FETCH_BALANCES]: (state, action) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Balances updated:', action.payload);
    }
    return updateState(state, 'balances', action.payload);
  },

  [ActionType.SET_MARKET_INFO]: (state, action) => updateMultipleState(state, {
    currentPairId: action.currentPairId,
    currentMarket: action.currentMarket,
    currentPair: action.currentPair
  }),

  [ActionType.FETCH_MARKET_TRADE_HISTORY]: (state, action) => updateState(state, 'tradingHistory', action.payload),

  [ActionType.FETCH_MARKET_ORDERS]: (state, action) => updateMultipleState(state, {
    bidOrders: action.payload?.buy || [],
    askOrders: action.payload?.sell || []
  }),

  [ActionType.SIGNALR_UPDATE_BALANCES]: (state, action) => updateState(state, 'balances', action.payload),

  [ActionType.CANCEL_USER_ORDER]: (state, action) => updateState(state, 'userOrders', action.payload),

  [ActionType.ADD_ORDER]: (state, action) => updateState(state, 'userOrders', action.payload),

  [ActionType.SET_MARKET_TYPE]: (state, action) => updateState(state, 'marketType', action.payload),

  [ActionType.SET_AVERAGE_COLOR]: (state, action) => updateState(state, 'averageColor', action.payload),

  [ActionType.UPDATE_MARKET_ORDERS]: (state, action) => updateMultipleState(state, {
    bidOrders: action.payload?.bidOrders || [],
    askOrders: action.payload?.askOrders || []
  }),

  [ActionType.FLUSH_ORDERBOOK]: (state) => updateMultipleState(state, {
    bidOrders: [],
    askOrders: []
  }),

  [ActionType.SET_NONCE]: (state, action) => updateState(state, 'nonce', action.payload),

  [ActionType.SET_PRIVATE_HUBCONNECTION]: (state, action) => updateState(state, 'privateHubConnection', action.payload),

  [ActionType.SET_TERMINAL_HUBCONNECTION]: (state, action) => updateState(state, 'terminalHubConnection', action.payload),

  [ActionType.SET_TRADINGVIEW]: (state, action) => updateState(state, 'tvChart', action.payload),

  [ActionType.BLUR_MARKET]: (state, action) => updateState(state, 'isBlur', action.payload),

  [ActionType.SET_ACCOUNT_SETTINGS]: (state, action) => updateState(state, 'settings', action.payload),

  [ActionType.FLUSH_ACCOUNT_SETTINGS]: (state) => updateState(state, 'settings', undefined),

  [ActionType.SET_globalPairName]: (state, action) => {
    if (action.payload) {
      safeLocalStorageSet('globalPairName', action.payload);
    }
    return updateState(state, 'globalPairName', action.payload);
  },

  [ActionType.SET_lastPrice]: (state, action) => updateState(state, 'lastPrice', action.payload),
  [ActionType.UPDATE_PARAMETER_SESSIONLIFETIME]: function (state: IState, action: any): IState {
    throw new Error('Function not implemented.');
  },
  [ActionType.SET_TWOSTEPTYPE]: function (state: IState, action: any): IState {
    throw new Error('Function not implemented.');
  },
  [ActionType.UPDATE_TICKER_and_QUOTE]: function (state: IState, action: any): IState {
    throw new Error('Function not implemented.');
  }
};

// ====================================================================================
// MAIN REDUCER
// ====================================================================================

const reducer = (state: IState, action: Action): IState => {
  const handler = actionHandlers[action.type];

  if (!handler) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Unknown action type: ${action.type}`);
    }
    return state;
  }

  try {
    return handler(state, action);
  } catch (error) {
    console.error(`Error in reducer for action ${action.type}:`, error);
    return state;
  }
};

export default reducer;

// ====================================================================================
// EXPORT TYPES FOR EXTERNAL USE
// ====================================================================================

export type { Action, BaseAction, SetMarketInfoAction, FetchMarketOrdersAction, UpdateMarketOrdersAction };