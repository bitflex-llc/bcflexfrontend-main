import { HubConnection, HubConnectionState } from '@microsoft/signalr';

import React from 'react';
import { Store } from '../store';
import { useCallback } from 'react';

export const useSignalR = (): {
    JoinPair: Function,
    LeavePair: Function,
    OnTicker: Function,
    OnUserOrdersUpdate: Function,
    Onweb_mobileactivate: Function,
    Onweb_enabledtwofactor: Function,
    Onweb_canceltwofactor: Function,
    Onweb_mobileisonline_true: Function,
    GetTerminalConnectionId: Function,
    Onweb_2step_confirmed: Function,
    Onguard_withdraw: Function,
    OnOrderbook: Function,
    OnBalanceUpdate: Function,
    On_web_passwordchange_confirm: Function,
    On_withdraw_result: Function,

    terminalInstance: HubConnection,
    privateInstance: HubConnection
} => {

    const {
        state: { terminalHubConnection, privateHubConnection } } = React.useContext(Store);

    const GetTerminalConnectionId = useCallback(() => {
        return terminalHubConnection?.connectionId;
    }, [terminalHubConnection]);

    async function JoinPair(pairId: string) {
        console.log('ATTEMPT TO JOIN', pairId)
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            terminalHubConnection.send('joinPairId', pairId)
            console.log('joinPairId', pairId)
        }
    }

    async function LeavePair(pairId: string) {
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            terminalHubConnection.send('leavePairId', pairId)
            console.log('leavePairId', pairId)
        }
    }

    const OnTicker = useCallback((ticker) => {
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            terminalHubConnection.on('ticker', ticker)
        }
    }, [terminalHubConnection])

    const OnUserOrdersUpdate = useCallback((userOrdersUpdate) => {
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('userOrdersUpdate', userOrdersUpdate)
        }
    }, [privateHubConnection])

    const OnBalanceUpdate = useCallback((balanceUpdate) => {
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('balanceUpdate', balanceUpdate)
        }
    }, [privateHubConnection])

    const OnOrderbook = useCallback((onOrderbook) => {
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            terminalHubConnection.on('orderBook', onOrderbook)
        }
    }, [terminalHubConnection])

    const Onweb_mobileactivate = useCallback((web_mobileactivate) => {
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('web_mobileactivate', web_mobileactivate)
        }
    }, [privateHubConnection])

    const Onweb_enabledtwofactor = useCallback((web_enabledtwofactor) => {
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('web_enabledtwofactor', web_enabledtwofactor)
        }
    }, [privateHubConnection])

    const Onweb_canceltwofactor = useCallback((web_canceltwofactor) => {
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('web_canceltwofactor', web_canceltwofactor)
        }
    }, [privateHubConnection])

    const Onweb_mobileisonline_true = useCallback((web_mobileisonline_true) => {
        // console.log("useCallback web_mobileisonline_true")
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('web_mobileisonline_true', web_mobileisonline_true)
        }
    }, [privateHubConnection])

    const Onweb_2step_confirmed = useCallback((web_2step_confirmed) => {
        // console.log("useCallback web_2step_confirmed")
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            terminalHubConnection.on('web_2step_confirmed', web_2step_confirmed)
        }
    }, [terminalHubConnection])

    const Onguard_withdraw = useCallback((guard_withdraw) => {
        // console.log("useCallback guard_withdraw")
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('guard_withdraw', guard_withdraw)
        }
    }, [privateHubConnection])

    const On_web_passwordchange_confirm = (callback) => {
        // console.log("useCallback guard_withdraw")
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('web_passwordchange_confirm', callback)
        }
    }

    const On_withdraw_result = (callback) => {
        // console.log("useCallback guard_withdraw")
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected) {
            privateHubConnection.on('withdraw_result', callback)
        }
    }

    return {
        JoinPair: JoinPair,
        LeavePair: LeavePair,
        OnTicker: OnTicker,
        OnUserOrdersUpdate: OnUserOrdersUpdate,
        Onweb_mobileactivate: Onweb_mobileactivate,
        Onweb_enabledtwofactor: Onweb_enabledtwofactor,
        Onweb_canceltwofactor: Onweb_canceltwofactor,
        Onweb_mobileisonline_true: Onweb_mobileisonline_true,
        GetTerminalConnectionId: GetTerminalConnectionId,
        Onweb_2step_confirmed: Onweb_2step_confirmed,
        Onguard_withdraw: Onguard_withdraw,
        OnOrderbook: OnOrderbook,
        OnBalanceUpdate: OnBalanceUpdate,
        On_web_passwordchange_confirm: On_web_passwordchange_confirm,
        On_withdraw_result: On_withdraw_result,
        terminalInstance: terminalHubConnection!,
        privateInstance: privateHubConnection!
    };
};