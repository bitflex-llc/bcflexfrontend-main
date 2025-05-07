import '../css/pure_bitflex2.css'
import 'react-toastify/dist/ReactToastify.css';
import 'react-grid-layout/css/styles.css'

import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import React, { useCallback, useEffect } from 'react';

import { API_ENDPOINT } from '../API';
import { ActionType } from '../store/actionTypes';
import { BitflexOpenApi } from '../_helpers/BitflexOpenApi';
import ReactGA from 'react-ga';
import { ReactNotifications } from 'react-notifications-component'
import { Store } from '../store';
import { authToken } from '../_helpers/auth-header';
import useUserState from '../hooks/useUserState';

const autoReconnections = [200, 200, 300, 300, 500, 500, 1000, 1000, 1500, 2000, 3333, 3333, 3333, 3333, 3333, 3333, 3333, 5000, 10000, 20000, 10000, 20000, 40000, 60000, 100000];

export function Layout(props) {

    const {
        state: { terminalHubConnection, privateHubConnection },
        dispatch
    } = React.useContext(Store);

    const { isSignedIn } = useUserState();

    const ConnectTerminal = useCallback(() => {
        console.log("ConnectTerminal()")
        if (!terminalHubConnection || terminalHubConnection === undefined) {
            const hubConnect = new HubConnectionBuilder()
                .withUrl(API_ENDPOINT + '/terminalhub')
                .withAutomaticReconnect(autoReconnections)
                .configureLogging(LogLevel.Trace)
                .build();
            try {
                hubConnect.start()
                    .then(() => {
                        dispatch({
                            type: ActionType.SET_TERMINAL_HUBCONNECTION,
                            payload: hubConnect
                        })
                    })
                    .catch(console.log)
            }
            catch (err) {
                // addToast(err, {
                //     appearance: 'error',
                //     autoDismiss: false,
                // })
            }
        }
    }, [dispatch, terminalHubConnection]);

    const ConnectPrivate = useCallback(() => {
        console.log("ConnectPrivate()")
        if (!privateHubConnection || privateHubConnection === undefined || isSignedIn) {
            const hubConnect = new HubConnectionBuilder()
                .withUrl(API_ENDPOINT + '/privatehub', { accessTokenFactory: () => authToken() })
                .withAutomaticReconnect(autoReconnections)
                .configureLogging(LogLevel.Trace)
                .build();
            try {
                hubConnect.start()
                    .then(() => {
                        dispatch({
                            type: ActionType.SET_PRIVATE_HUBCONNECTION,
                            payload: hubConnect
                        });
                        console.log("ConnectPrivate() ConnectionId", hubConnect.connectionId)
                    })
                    .catch(console.log)


            }
            catch (err) {
                // if (GlobalVars.isInDebugMode)
                //     addToast(err, {
                //         appearance: 'error',
                //         autoDismiss: false,
                //     })
            }
        }
    }, [dispatch, isSignedIn, privateHubConnection]);

    useEffect(() => {
        if (isSignedIn) {
            ConnectPrivate();
        }
        ConnectTerminal();
    }, [isSignedIn]);

    useEffect(() => {
        ReactGA.initialize('UA-93353129-1');
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <div>
            <ReactNotifications />
            {props.children}
        </div>
    );
}