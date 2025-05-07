import 'moment-timezone';

import { ApiTickers, PriceAlert, PriceAlertCompareType, PriceAlertCreateStatus } from '../../api-wrapper/api';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { ICurrency, IState } from '../../store/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BFGradientButton } from '../html/BFGradientButton';
import { BFPortlet } from '../html/BFPortlet';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { DispacherBaseTypes } from './index';
import { FaTrash } from 'react-icons/fa';
import { Store } from '../../store';
import { useTranslation } from 'react-i18next';

export function PriceAlertPortlet({
    currency,
    baseCurrency,
    userAlerts,
    dispatch_userAlerts,
    isLoading,
    tickers
}: {
    currency: string,
    baseCurrency: string,
    userAlerts: PriceAlert[],
    dispatch_userAlerts: React.Dispatch<{ type: any; value: any; }>,
    isLoading?: Boolean,

    tickers?: Array<ApiTickers>,
}) {

    const {
        lastPrice,
        currencies,
        globalPairName
    } = React.useContext(Store).state as IState;

    const [comparer, setcomparer] = useState<PriceAlertCompareType>(PriceAlertCompareType.LessOrEqual);
    const [price, setprice] = useState<number>();
    const [pairCurrencyInfo, setpairCurrencyInfo] = useState<ICurrency>();

    const { t } = useTranslation();

    const [baseCurrencyInfo, setbaseCurrencyInfo] = useState<ICurrency>();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    React.useEffect(() => {
        if (!currency || !baseCurrency || !currencies) return;

        setpairCurrencyInfo(currencies.find((x: ICurrency) => x.symbol === currency))
        setbaseCurrencyInfo(currencies.find((x: ICurrency) => x.symbol === baseCurrency))

    }, [currency, baseCurrency, currencies]);

    const [isButtonLoading, setisButtonLoading] = useState(false);

    const [isAmountValid, setisAmountValid] = useState(false);

    const [currentTicker, setcurrentTicker] = useState<ApiTickers>();

    const CreateAlertSubmit = useCallback(() => {
        if (!price || isNaN(price)) return;

        setisButtonLoading(true)

        BitflexOpenApi.NotificationsApi.apiVversionNotificationsPricealertPost("1.0", { pairName: baseCurrency + "_" + currency, price, comparer })
            .then(response => {
                switch (response.data.status) {
                    case PriceAlertCreateStatus.Created:
                        dispatch_userAlerts({ type: DispacherBaseTypes.INIT_LOAD, value: response.data.currentAlerts });
                        break;
                    case PriceAlertCreateStatus.FailAlreadyExists:
                        BFNotifictionRef.current?.Notify(t('Error'), t('Price Already Exists'), BFNotificationType.Error);
                        break;
                    case PriceAlertCreateStatus.SystemError:
                        BFNotifictionRef.current?.Notify(t('Error'), t('System Error. Try again later'), BFNotificationType.Error);
                        break;
                }
            })
            .finally(() => setisButtonLoading(false))
    }, [price, currency, baseCurrency, comparer, dispatch_userAlerts, t])

    const RemoveAlert = useCallback((alertId) => {
        if (!userAlerts) return;

        BitflexOpenApi.NotificationsApi.apiVversionNotificationsPricealertDelete("1.0", alertId)
        dispatch_userAlerts({ type: DispacherBaseTypes.DELETE, value: alertId });
    }, [dispatch_userAlerts, userAlerts])

    useEffect(() => {
        console.log("isAmountValid", isAmountValid)
    }, [isAmountValid]);

    useEffect(() => {
        setcurrentTicker(tickers?.find((x => x.pair === globalPairName)))
    }, [globalPairName, tickers]);


    return (
        <BFPortlet
            title={t('Price Alerts')}
            isLoading={isLoading}
            isStringUnauthenticated={true}
            // renderBlurredAnyway={true} 
            isBlockUnauthorized={true}>
            <BFNotification ref={BFNotifictionRef} />
            <div style={{ margin: 12 }}>
                <div style={{ position: 'absolute', zIndex: 1, opacity: 0.05, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <img src={pairCurrencyInfo?.imageBase64} height={250} alt={'price alert'} />
                </div>
                <div style={{ zIndex: 5, position: 'relative', textAlign: 'center' }}>
                    <span style={{ color: "white", fontSize: 20 }}><span className={'font-roboto-condensed'}>{currentTicker?.price!.toFixed(8)}</span>&nbsp;{baseCurrencyInfo?.symbol}</span>
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Current Price</p>
                    <div style={{ flexDirection: 'row', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', flexFlow: 'nowrap' }}>
                        <span style={{ color: 'white', fontSize: 18 }}>{pairCurrencyInfo?.name} Price: </span>
                        <div className="menu-market-type-selector">
                            <div
                                onClick={() => setcomparer(PriceAlertCompareType.LessOrEqual)}
                                className={comparer === PriceAlertCompareType.LessOrEqual ? "menu-market-type-selector-spot selected-navmenu-spot" : "menu-market-type-selector-spot"}
                                style={{ width: 40, height: 38, fontSize: 22, lineHeight: '32px' }}
                            >≤</div>
                            <div
                                onClick={() => setcomparer(PriceAlertCompareType.MoreOrEqual)}
                                className={comparer === PriceAlertCompareType.MoreOrEqual ? "menu-market-type-selector-margin selected-navmenu-margin" : "menu-market-type-selector-margin"}
                                style={{ width: 40, height: 38, fontSize: 22, lineHeight: '32px' }}
                            >≥</div>
                        </div>
                        <div style={{ position: 'relative', width: '35%' }}>
                            <BFInput type={BFInputType.Decimal} onValidated={setisAmountValid} width={"100%"} placeholder={t('Price')} onValue={setprice} leftsideSymbol={baseCurrencyInfo?.symbol} />
                        </div>
                    </div>
                    <div style={{ height: 90, overflow: 'hidden' }}>
                        {userAlerts.length === 0
                            ? <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.75)', padding: 20, paddingBottom: 0, marginBottom: 0 }}>We will send you Push Notification on all your connected devices and also Email when the price triggers</div>
                            : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.75)', padding: 20, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                {userAlerts.map((alertItem) => {
                                    return (
                                        <div style={{
                                            borderWidth: 1, borderColor: 'rgba(255,170,4,0.6)', borderStyle: 'dashed',
                                            flexDirection: 'row', display: 'inline-flex', borderRadius: 4, height: 25, padding: 2, margin: 2, paddingRight: 6, paddingLeft: 6,
                                            backgroundColor: alertItem.comparer === PriceAlertCompareType.MoreOrEqual ? 'rgba(224, 60, 45, 0.3)' : 'rgba(53, 203, 59, 0.3)', alignContent: 'center', alignItems: 'center',

                                        }}>
                                            <div style={{ color: 'white', fontWeight: 500, }} className={'font-roboto-condensed'}>{alertItem.price?.toFixed(6)}</div>
                                            <div onClick={() => RemoveAlert(alertItem.id)} key={alertItem.price} style={{ fontSize: 10, paddingLeft: 5, cursor: 'pointer' }}><FaTrash /></div>
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    </div>
                    <div style={{ marginTop: 10 }}>
                        <BFGradientButton
                            isDisabled={!isAmountValid}
                            isLoading={isButtonLoading}
                            onPress={CreateAlertSubmit}
                            text={t('Create Price Alert')}
                            width={'100%'}
                        />
                    </div>
                </div>
            </div>
        </BFPortlet>
    );
}