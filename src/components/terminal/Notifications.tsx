import 'react-tabs/style/react-tabs.css';
import 'firebase/messaging';

/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { DeviceType } from '../../api-wrapper';
import { FaCircle } from 'react-icons/fa';
import { ICurrency } from '../../store/types';
import { Link } from 'react-router-dom';
import { Store } from '../../store';
import { isChrome } from 'react-device-detect';
// import { messaging } from "../../init-fcm";
import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import useLocalStorage from '../../hooks/useLocalStorage';
import useUserState from '../../hooks/useUserState';

if (isChrome) {
    // navigator.serviceWorker.register('/service-worker.js').then(registration => {
    //     messaging.useServiceWorker(registration)
    // })
}

export function Notifications() {
    const { t } = useTranslation();
    const {
        state: { globalPairName, tickers, currentMarket, currentPair, balances, lastPrice, currencies, averageColor } } = React.useContext(Store);

    const { bitflexDeviceId } = useBitflexDeviceId();

    const { isSignedIn } = useUserState();

    const [notificationPrice, setNotificationPrice] = React.useState(0);
    const [notificationPercent, setNotificationPercent] = React.useState(0);

    const [initialPrice, setinitialPrice] = useState(0);

    const words = {
        Price: t('Price'),
        MarketPrice: t('Market Price'),
        LimitOrder: t('Limit Order'),
        MarketOrder: t('Market Order'),
        Amount: t('Amount'),
        Percent: t('Amount')
    };

    const [pairCurrency, setPairCurrency] = React.useState<ICurrency>();

    async function askUserPermission() {
        // if (messaging) {
        //     Notification.requestPermission()
        //         .then(async function (result) {
        //             if (result !== "granted") return;

        //             messaging.getToken().then((currentToken) => {
        //                 if (currentToken) {
        //                     BitflexOpenApi.ApplicationApi.apiVversionApplicationSetpushtokenPost("1.0", { pushToken: currentToken, description: "Chrome 3 Test", device: DeviceType.Chrome })
        //                 } else {
        //                     console.log('No Instance ID token available. Request permission to generate one.');
        //                 }
        //             }).catch((err) => {
        //                 console.log('An error occurred while retrieving token. ', err);

        //             });
        //         })
        //         .catch(function (err) {
        //             console.log("Unable to get permission to notify.", err);
        //         });
        // }
    }

    useEffect(() => {

        // messaging.onTokenRefresh(() => {
        //     messaging.getToken().then((refreshedToken) => {
        //         console.log('Token refreshed.');
        //         SetPushToken(refreshedToken, "Chrome 2 Test", 2, deviceId)
        //         // ...
        //     }).catch((err) => {
        //         console.log('Unable to retrieve refreshed token ', err);
        //     });
        // });

        if (isChrome) {
            navigator.serviceWorker.addEventListener("message", () => {
                navigator.serviceWorker.getRegistration().then(reg => {
                    reg?.showNotification("GE")
                })
            });
        }

    }, []);

    React.useEffect(() => {

        if (currentPair === '' || currentMarket === '' || currencies.length === 0 || balances.length === 0 || !tickers) return;

        var currencyPair = currencies.find(x => x.symbol === currentPair) as ICurrency;
        setPairCurrency(currencyPair);


        var ticker = tickers.find(x => x.pair === globalPairName);
        if (ticker && ticker.price) {
            setNotificationPrice(ticker.price)
            setinitialPrice(ticker.price)
        }

    }, [balances, currencies, currentPair, currentMarket, tickers, globalPairName]);


    function Plus() {
        var newPercentValue = notificationPercent + 1;
        setNotificationPercent(newPercentValue)
        setNotificationPrice(parseFloat((initialPrice + (initialPrice / 100 * newPercentValue)).toFixed(8)))
    }

    function Minus() {
        var newPercentValue = notificationPercent - 1;
        setNotificationPercent(newPercentValue)
        setNotificationPrice(parseFloat((initialPrice + (initialPrice / 100 * newPercentValue)).toFixed(8)))
    }

    function LimitForm() {
        if (pairCurrency === undefined) return;
        return (
            <div className="portlet-body">
                <div className='coininformation-div'>
                    <div className='coininformation-image'>
                        <img id='pairCurrency-image' src={pairCurrency.imageBase64} className='image-createorder-form' />
                    </div>
                    <div className='coininformation-name'>
                        <div className='coininformation-title'>
                            {pairCurrency.name} <Trans>Price</Trans>
                        </div>
                        <div className='coininformation-value'>
                            {lastPrice?.toFixed(8)} {currentMarket}
                        </div>
                    </div>
                </div>
                <div className='input-div-inline form-group has-feedback'>
                    <input className="input-inline-form" onChange={e => setNotificationPrice(parseFloat(e.target.value))} type="text" value={notificationPrice} placeholder={words.Price} style={{ width: '66%' }} />
                    <span className="icon-left" style={{ width: currentMarket.length > 3 ? '15%' : '11%', left: currentMarket.length > 3 ? '42%' : '47%' }}>{currentMarket}</span>
                    <div className='span_between'></div>
                    <div className="number-input">
                        <button onClick={Minus}></button>
                        <input className="input-inline-form number-input" onChange={e => setNotificationPercent(parseFloat(e.target.value))} type="number" value={notificationPercent} placeholder={'%'} style={{ width: '34%' }} />
                        <button className="plus" onClick={Plus}></button>
                    </div>
                </div>
                {isSignedIn &&
                    <div className='createorder_container'>
                        <div className="buydiv" style={{ width: '100%' }}>
                            <button className="btn btn-md hoverbutton buybutton" type="button" onClick={askUserPermission}>
                                <Trans>Create Notification</Trans>
                            </button>
                        </div>
                    </div>
                }
            </div>
        )
    }

    return (
        <div className="portlet light portlet-fit bordered" style={{ height: '100%' }}>
            {!isSignedIn && <div className="blocklogin-overlay">
                <div className="blocklogin-content">
                    <Link className="btn btn-lg bf-login-button" style={{ margin: 0 }} to={"/signin"}>Login</Link>
                    <br />
                    <p style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>OR</p>
                    <Link className="btn btn-lg bf-register-button" style={{ margin: 0 }} to={"/signup"}>Register</Link>
                </div>
            </div>
            }
            <div className="portlet-title draggable">
                <div className="caption"><FaCircle style={{ fontSize: 11, color: averageColor, marginRight: 6 }} />
                    <Trans>
                        Notifications
                    </Trans>
                </div>
            </div>
            <div className={!isSignedIn ? 'blocklogin-item' : ''}>
                {LimitForm()}
            </div>
        </div>
    );
}