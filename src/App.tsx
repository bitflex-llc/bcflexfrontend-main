/* eslint-disable no-mixed-operators */
import React, { lazy, useEffect } from 'react';

import { lazyWithPreload } from "react-lazy-with-preload";
import { useIdleTimer } from 'react-idle-timer'

import Modal from 'react-modal';
import { Route } from 'react-router';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import IndexRoute from './components/IndexRoute'

import TerminalIndex from './components/terminal'
import ReactGA from "react-ga";

import { useBitflexDeviceId } from './hooks/useBitflexDeviceId';
import { withTracker } from './hooks/withTracker';

import { ConfirmEmail } from './components/signing/ConfirmEmail';
import { Layout } from './components/Layout';
import { Invite } from './components/staticpages/invite';
import { CoinTokenAdd } from './components/dashboard/admin/cointokenadd';
import { BitflexOpenApi } from './_helpers/BitflexOpenApi';
import { Routes } from 'react-router-dom';
import ApplyTo from './components/p2p/applyto';
import P2PCreate from './components/p2p/P2PCreate';
import CheckKYC from './components/dashboard/admin/checkkyc';
import VerifyManualDeposit from './components/dashboard/admin/verifymanualdeposit';
import VerifyManualwithdraw from './components/dashboard/admin/verifymanualwithdraw';
// import Launchpad from './components/launchpad';

BitflexOpenApi.Init();

// const TerminalIndex = lazyWithPreload(() => import('./components/IndexRoute'));
// TerminalIndex.preload();


const Paymentgateway = lazyWithPreload(() => import('./components/payments'));

const Payments_User_Merchants = lazyWithPreload(() => import('./components/payments/user/Merchants'));
const Payments_User_Merchants_Information = lazyWithPreload(() => import('./components/payments/user/MerchantPanel'));

const ActiveOrders = lazyWithPreload(() => import('./components/dashboard/trading/ActiveOrders'));
const ActivePositions = lazyWithPreload(() => import('./components/dashboard/trading/ActivePositions'));
const Affiliate = lazyWithPreload(() => import('./components/staticpages/affiliate'));
const Api = lazyWithPreload(() => import('./components/staticpages/api'));
const ApiKeys = lazyWithPreload(() => import('./components/dashboard/settings/ApiKeys'));

const Devices = lazyWithPreload(() => import('./components/dashboard/settings/Devices'));
const KYC = lazyWithPreload(() => import('./components/dashboard/settings/KYC'));
const EditUser = lazyWithPreload(() => import('./components/dashboard/admin/edituser'));
const EnableTwoFactor = lazyWithPreload(() => import('./components/dashboard/settings/security/EnableTwoFactor'));
const Fees = lazyWithPreload(() => import('./components/staticpages/fees'));
const History = lazyWithPreload(() => import('./components/dashboard/wallet/History'));
const Manage = lazyWithPreload(() => import('./components/dashboard/affiliate/Manage'));


const PrivacyPolicy = lazyWithPreload(() => import('./components/staticpages/privacypolicy'));
// const Route = lazyWithPreload(() => import('./components/Route'));
const ResetPassword = lazyWithPreload(() => import('./components/signing/resetpassword'));
const Restore = lazyWithPreload(() => import('./components/signing/restore'));

const SearchUser = lazyWithPreload(() => import('./components/dashboard/admin/searchuser'));
const Security = lazyWithPreload(() => import('./components/dashboard/settings/security'));

const Signin = lazyWithPreload(() => import('./components/signing/signin'));
const Signup = lazyWithPreload(() => import('./components/signing/signup'));

const Status = lazyWithPreload(() => import('./components/staticpages/status'));
const Support = lazyWithPreload(() => import('./components/staticpages/support'));
const Terms = lazyWithPreload(() => import('./components/staticpages/Terms'));
const Legal = lazyWithPreload(() => import('./components/staticpages/legal'));


const OrdersPositionsHistory = lazyWithPreload(() => import('./components/dashboard/trading/OrdersPositionsHistory'));
const P2p = lazyWithPreload(() => import("./components/p2p"));
const Nft = lazyWithPreload(() => import("./components/nft"));
const Launchpad = lazyWithPreload(() => import("./components/launchpad"));
const MyAssets = lazyWithPreload(() => import('./components/dashboard/wallet/MyAssets'));
ReactGA.initialize("UA-156987502-1");


export default function App() {
  useBitflexDeviceId();

  useEffect(() => {
    Modal.setAppElement('body');

    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);


  const handleOnIdle = event => {
    // console.log('user is idle', event)
    // console.log('last active', getLastActiveTime())
  }

  const handleOnActive = event => {
    // console.log('user is active', event)
    // console.log('time remaining', getRemainingTime())
  }

  const handleOnAction = event => {
    // console.log('user did something', event)
  }

  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 5000,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction,
    debounce: 100
  })

  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LdfrrIkAAAAAO1hwR1W7jV4PNSGk_maZiscQ2Ck">
      <Layout>
        <Routes>

          <Route path='/' element={<TerminalIndex />} />
          <Route path='/r/:refId' element={<Invite/>} />

          <Route path='/pay/:transactionId' element={<Paymentgateway/>} />

          <Route path='/payments/merchants' element={<Payments_User_Merchants/>} />
          <Route path='/payments/merchants/:merchantId' element={<Payments_User_Merchants_Information/>} />

          <Route path='/terminal/:base_quote_pair?' element={<TerminalIndex/>} />

          <Route path='/signin/:callback?' element={<Signin/>} />
          <Route path='/signup/:callback?' element={<Signup/>} />

          <Route path='/fees' element={<Fees/>} />
          <Route path='/api' element={<Api/>} />
          <Route path='/status' element={<Status/>} />
          <Route path='/affiliate' element={<Affiliate/>} />
          <Route path='/privacy' element={<PrivacyPolicy/>} />
          <Route path='/terms' element={<Terms/>} />
          <Route path='/legal' element={<Legal/>} />

          <Route path='/support' element={<Support/>} />

          {/* rgb(9, 9, 11) */}

          <Route path='/signing/restore' element={<Restore/>} />
          <Route path='/signing/resetpassword' element={<ResetPassword/>} />
          <Route path='/resetpassword' element={<ResetPassword/>} />

          <Route path='/confirmemail' element={<ConfirmEmail/>} />

          <Route path='/p2p' element={<P2p/>} />

          <Route path='/nft' element={<Nft/>} />

          <Route path='/launchpad' element={<Launchpad/>} />


          <Route path='/settings/security' element={<Security/>} />

          <Route path='/settings/devices' element={<Devices/>} />


          <Route path='/settings/kyc' element={<KYC/>} />

          <Route path='/p2p/applyto' element={<ApplyTo/>} />

          <Route path='/p2p/create' element={<P2PCreate/>} />


          <Route path='/settings/apikeys' element={<ApiKeys/>} />

          {/* <Route path='/enable2fa' element={<EnableTwoFactor/>} /> */}

          <Route path='/dashboard/affiliate' element={<Manage/>} />

          <Route path='/dashboard/tradehistory' element={<OrdersPositionsHistory/>} />

          <Route path='/dashboard/orders' element={<ActiveOrders/>} />
          <Route path='/dashboard/positions' element={<ActivePositions/>} />

          <Route path='/admin/cointokenadd' element={<CoinTokenAdd/>} />
          <Route path='/admin/searchuser' element={<SearchUser/>} />
          <Route path='/admin/edituser/:email' element={<EditUser/>} />

          <Route path='/admin/kycrequest/:guid' element={<CheckKYC/>} />

          <Route path='/admin/verifymanualdeposit/:guid' element={<VerifyManualDeposit/>} />

          <Route path='/admin/verifymanualwithdraw/:guid' element={<VerifyManualwithdraw/>} />

          <Route path='/wallet' element={<MyAssets/>} />
          <Route path='/wallet/assets' element={<MyAssets/>} />
          <Route path='/wallet/history' element={<History/>} />

          <Route path='/deposit/:currency' element={<MyAssets/>} />
          <Route path='/withdraw/:currency' element={<MyAssets/>} />

          <Route path="*" element={<p>There's nothing here: 404!</p>} />


        </Routes>
      </Layout>
    </GoogleReCaptchaProvider>
  );
}