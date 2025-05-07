import { Dispatch, IAction } from './types';

import { ActionType } from "./actionTypes";
import { BitflexOpenApi } from '../_helpers/BitflexOpenApi';
import { IChartingLibraryWidget } from '../components/charting_library/charting_library';

export const SetBlur = async (isBlur: boolean, dispatch: Dispatch): Promise<IAction | any> => {
    dispatch({
        type: ActionType.BLUR_MARKET,
        payload: isBlur
    });
}

export const SetNonce = async (nonce: string, dispatch: Dispatch): Promise<IAction | any> => {
    dispatch({
        type: ActionType.SET_NONCE,
        payload: nonce
    });
}

export const SetTradingViewChart = async (tvChart: IChartingLibraryWidget, dispatch: Dispatch): Promise<IAction | any> => {
    dispatch({
        type: ActionType.SET_TRADINGVIEW,
        payload: tvChart
    });
}

export const getBalances = async (dispatch: Dispatch): Promise<IAction | any> => {
    BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0",).then(response => {
        dispatch({
            type: ActionType.FETCH_BALANCES,
            payload: response.data.balances
        });
    });
}

export const SetMarketType = async (marketType: string, dispatch: Dispatch): Promise<IAction | any> => {
    dispatch({
        type: ActionType.SET_MARKET_TYPE,
        payload: marketType
    });
}