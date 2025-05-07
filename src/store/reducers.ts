import { ActionType } from './actionTypes';

function reducer(state, action) {
  switch (action.type) {

    case ActionType.FETCH_TICKERS:
      return { ...state, tickers: action.payload };

    case ActionType.FETCH_CURRENCIES:
      return { ...state, currencies: action.payload };

    case ActionType.FETCH_BALANCES:
      console.log(action.payload)
      return { ...state, balances: action.payload };

    case ActionType.SET_MARKET_INFO:
      return { ...state, currentPairId: action.currentPairId, currentMarket: action.currentMarket, currentPair: action.currentPair }

    case ActionType.FETCH_MARKET_TRADE_HISTORY:
      return { ...state, tradingHistory: action.payload };

    case ActionType.FETCH_MARKET_ORDERS:
      return { ...state, bidOrders: action.payload.buy, askOrders: action.payload.sell };

    case ActionType.SIGNALR_UPDATE_BALANCES:
      return { ...state, balances: action.payload };

    // case ActionType.FETCH_USER_ORDERS:
    //   return { ...state, userOrders: action.payload.openOrders, userHistoryOrders: action.payload.closedOrders };

    case ActionType.CANCEL_USER_ORDER:
      return { ...state, userOrders: action.payload };

    case ActionType.ADD_ORDER:
      return { ...state, userOrders: action.payload };

    case ActionType.SET_MARKET_TYPE:
      return { ...state, marketType: action.payload };

    case ActionType.SET_AVERAGE_COLOR:
      return { ...state, averageColor: action.payload };

    case ActionType.UPDATE_MARKET_ORDERS:
      return { ...state, bidOrders: action.payload.bidOrders, askOrders: action.payload.askOrders };

    case ActionType.FLUSH_ORDERBOOK:
      return { ...state, bidOrders: [], askOrders: [] };

    case ActionType.SET_NONCE:
      return { ...state, nonce: action.payload };

    case ActionType.SET_PRIVATE_HUBCONNECTION:
      return { ...state, privateHubConnection: action.payload };

    case ActionType.SET_TERMINAL_HUBCONNECTION:
      return { ...state, terminalHubConnection: action.payload };

    case ActionType.SET_TRADINGVIEW:
      return { ...state, tvChart: action.payload };

    case ActionType.BLUR_MARKET:
      return { ...state, isBlur: action.payload };

    case ActionType.SET_ACCOUNT_SETTINGS:
      return { ...state, settings: action.payload };

    case ActionType.FLUSH_ACCOUNT_SETTINGS:
      return { ...state, settings: null };

    case ActionType.SET_globalPairName:
      {
        localStorage.setItem("globalPairName", action.payload);
        return { ...state, globalPairName: action.payload }
      }

    case ActionType.SET_lastPrice:
        return { ...state, lastPrice: action.payload }
      
    default:
      return state;
  }
}

export default reducer;