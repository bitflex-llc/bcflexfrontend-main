import '../css/pure_bitflex2.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-grid-layout/css/styles.css';

import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ReactNotifications } from 'react-notifications-component';
import ReactGA from 'react-ga';

import { API_ENDPOINT } from '../API';
import { Store } from '../store';
import { ActionType } from '../store/actionTypes';
import { authToken } from '../_helpers/auth-header';
import useUserState from '../hooks/useUserState';

// ====================================================================================
// CONSTANTS
// ====================================================================================

const AUTO_RECONNECT_DELAYS = [
  200, 200, 300, 300, 500, 500, 1000, 1000, 1500, 2000, 
  3333, 3333, 3333, 3333, 3333, 3333, 3333, 5000, 10000, 
  20000, 10000, 20000, 40000, 60000, 100000
];

const GA_TRACKING_ID = 'UA-93353129-1';

// ====================================================================================
// INTERFACES
// ====================================================================================

interface LayoutProps {
  children: React.ReactNode;
}

// ====================================================================================
// MAIN COMPONENT
// ====================================================================================

export function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useContext(Store);
  const { terminalHubConnection, privateHubConnection } = state;
  const { isSignedIn } = useUserState();

  // Track initialization to prevent duplicate calls
  const initializationRef = useRef({
    gaInitialized: false,
    terminalConnecting: false,
    privateConnecting: false
  });

  // Connect to terminal hub (public connection)
  const connectTerminal = useCallback(async () => {
    if (terminalHubConnection || initializationRef.current.terminalConnecting) {
      return;
    }

    console.log('Connecting to terminal hub...');
    initializationRef.current.terminalConnecting = true;

    try {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`${API_ENDPOINT}/terminalhub`)
        .withAutomaticReconnect(AUTO_RECONNECT_DELAYS)
        .configureLogging(LogLevel.Warning) // Reduced from Trace for performance
        .build();

      await hubConnection.start();
      
      dispatch({
        type: ActionType.SET_TERMINAL_HUBCONNECTION,
        payload: hubConnection
      });

      console.log('Terminal hub connected successfully');
    } catch (error) {
      console.error('Failed to connect to terminal hub:', error);
    } finally {
      initializationRef.current.terminalConnecting = false;
    }
  }, [dispatch, terminalHubConnection]);

  // Connect to private hub (authenticated connection)
  const connectPrivate = useCallback(async () => {
    if (!isSignedIn || privateHubConnection || initializationRef.current.privateConnecting) {
      return;
    }

    console.log('Connecting to private hub...');
    initializationRef.current.privateConnecting = true;

    try {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`${API_ENDPOINT}/privatehub`, { 
          accessTokenFactory: () => authToken() 
        })
        .withAutomaticReconnect(AUTO_RECONNECT_DELAYS)
        .configureLogging(LogLevel.Warning) // Reduced from Trace for performance
        .build();

      await hubConnection.start();
      
      dispatch({
        type: ActionType.SET_PRIVATE_HUBCONNECTION,
        payload: hubConnection
      });

      console.log('Private hub connected successfully, ConnectionId:', hubConnection.connectionId);
    } catch (error) {
      console.error('Failed to connect to private hub:', error);
    } finally {
      initializationRef.current.privateConnecting = false;
    }
  }, [dispatch, isSignedIn, privateHubConnection]);

  // Initialize Google Analytics
  const initializeGA = useCallback(() => {
    if (initializationRef.current.gaInitialized) {
      return;
    }

    ReactGA.initialize(GA_TRACKING_ID);
    ReactGA.pageview(window.location.pathname + window.location.search);
    initializationRef.current.gaInitialized = true;
  }, []);

  // Handle connection management based on auth state
  useEffect(() => {
    connectTerminal();
    
    if (isSignedIn) {
      connectPrivate();
    }
  }, [isSignedIn, connectTerminal, connectPrivate]);

  // Initialize GA on mount
  useEffect(() => {
    initializeGA();
  }, [initializeGA]);

  // Cleanup connections on unmount
  useEffect(() => {
    return () => {
      if (terminalHubConnection) {
        terminalHubConnection.stop().catch(console.error);
      }
      if (privateHubConnection) {
        privateHubConnection.stop().catch(console.error);
      }
    };
  }, [terminalHubConnection, privateHubConnection]);

  return (
    <div>
      <ReactNotifications />
      {children}
    </div>
  );
}