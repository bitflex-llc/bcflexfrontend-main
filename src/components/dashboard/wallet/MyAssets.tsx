import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { DeviceType, GetApiMarketsCurrenciesResponse, GetBalanceRequestModel } from '../../../api-wrapper';
import { useTranslation } from 'react-i18next';
import { isMobile, isSafari } from 'react-device-detect';
import { useEffect, useReducer, useState } from 'react';

import { BFModalWindow } from '../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { DepositModal } from './deposit';
import { DispacherBaseTypes } from '../../terminal';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { WithdrawModal } from './WithdrawModal';
import { useBitflexDeviceId } from '../../../hooks/useBitflexDeviceId';
import { useCallback } from 'react';
import { useCryptoKeys } from '../../../hooks/useCryptoKeys';
import { useLocation } from 'react-router-dom';
import { DepositINRModal } from './depositinr';
import { WithdrawInr } from './withdrawInr';


interface StateType {
    requireSetPush: boolean
}

export default function MyAssets() {

    const location = useLocation();

    const [isDepositModalActive, setisDepositModalActive] = useState(false);
    const [currencyToDeposit, setcurrencyToDeposit] = useState<string>();

    const [isWithdrawModalActive, setisWithdrawModalActive] = useState(false);
    const [currencyToWithdraw, setcurrencyToWithdraw] = useState<string>();

    const { bitflexDeviceId } = useBitflexDeviceId();

    const [balancesLoading, setbalancesLoading] = useState(true);
    const [currenciesLoading, setcurrenciesLoading] = useState(true);

    const { t } = useTranslation();


    const { publicKey } = useCryptoKeys();

    const checkRemotePermission = async function (permissionData) {
        if (isMobile) return;
        if (permissionData.permission === 'default') {
            // This is a new web service URL and its validity is unknown.
            const result = window.safari.pushNotification.requestPermission(
                'https://bcflex.com/push', // The web service URL.
                'web.com.bit-flex',     // The Website Push ID.
                { deviceId: bitflexDeviceId }, // Data that you choose to send to your server to help you identify the user.
                checkRemotePermission         // The callback function.
            );

            console.log("result", result)
        }
        else if (permissionData.permission === 'denied') {
            // The user said no.
        }
        else if (permissionData.permission === 'granted') {
            BitflexOpenApi.ApplicationApi.apiVversionApplicationSetpushtokenPost("1.0", {
                pushToken: permissionData.deviceToken,
                description: "Test Safari Browser Data",
                device: DeviceType.Safari,
                publicKey: publicKey
            }).catch(error => console.warn("ApplicationApi.apiVversionApplicationSetpushtokenPost", error))
        }
    };

    useEffect(() => {
        LoadData();
    }, [])

    async function LoadData() {
        setcurrenciesLoading(true)
        BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0",)
            .then(response =>
                dispatch_balances({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data.balances
                }))
            .finally(() => setcurrenciesLoading(false))


        BitflexOpenApi.MarketsApi.apiVversionMarketsCurrenciesGet("1.0").then(response => {
            localStorage.setItem('currencies', JSON.stringify(response.data));
            dispatch_currencies({ type: DispacherBaseTypes.INIT_LOAD, value: response.data });
        });
    }


    const [currencies, dispatch_currencies] = useReducer((currencies: Array<GetApiMarketsCurrenciesResponse>, { type, value }): Array<GetApiMarketsCurrenciesResponse> => {
        const index = currencies.findIndex((item) => item.name === value.name);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setcurrenciesLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...currencies, value];
                else {
                    const newValue = [...currencies];
                    newValue[index] = value;
                    return newValue;
                }
            default: return currencies;
        }
    }, []);

    const [balances, dispatch_balances] = useReducer((balances: Array<GetBalanceRequestModel>, { type, value }): Array<GetBalanceRequestModel> => {
        const index = balances.findIndex((item) => item.currency === value.currency);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setbalancesLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...balances, value];
                else {
                    const newBalances = [...balances];
                    newBalances[index] = value;
                    return newBalances;
                }
            default: return balances;
        }
    }, []);


    useEffect(() => {
        if (isMobile) return;
        if (location.state && location.state.requireSetPush) {
            BitflexOpenApi.ApplicationApi.apiVversionApplicationPublicKeyPut("1.0", {
                bitflexDeviceId: bitflexDeviceId,
                deviceType: isSafari ? DeviceType.Safari : DeviceType.Chrome,
                publicKeyPEM: publicKey
            });
        }
    }, [bitflexDeviceId, location, publicKey]);

    const RenderBalanceList = useCallback(() => {
        if (!balances || !currencies || balances.length === 0 || currencies.length === 0) return;
        // setisLoading(false)
        return balances.map(coinBalance => {
            var symbol = currencies.find(x => x.symbol === coinBalance.currency);

            if (!symbol) return <></>;

            var image = symbol.imageBase64;
            return (
                <>
                    <tr style={{ fontSize: 12, height: 30, alignItems: 'center' }}>
                        <td className='tdFix tdFix-left'>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <div><img alt="image1" style={{ maxHeight: 18, marginTop: 4, marginRight: 5 }} src={image!} /></div>
                                <div>{!isMobile && symbol.name + " |"} {coinBalance.currency}</div>
                            </div>
                        </td>
                        <td className='tdFix'>{coinBalance.available?.toFixed(4)}</td>
                        {!isMobile && <td className='tdFix'>{coinBalance.onOrders?.toFixed(4)}</td>}
                        <td className='tdFix'>{coinBalance.total?.toFixed(4)}</td>
                        <td className='tdFix' style={{ cursor: 'pointer', display: 'inline-flex', textAlign: 'center', width: isMobile ? '100%' : '95%', placeContent: 'space-evenly' }} onClick={() => {

                        }}>

                            <BFGradientButton text={t('Deposit')} buttonType={isMobile ? BFGradientButtonType.GoldenBorderActionSmall : BFGradientButtonType.GoldenBorder} width={isMobile ? 'unset' : 95} onPress={() => {
                                setcurrencyToDeposit(coinBalance.currency!);
                                setisDepositModalActive(true)
                            }} />

                            <BFGradientButton text={t('Withdraw')} buttonType={isMobile ? BFGradientButtonType.GoldenBorderActionSmall : BFGradientButtonType.GoldenBorder} width={isMobile ? 'unset' : 95} onPress={() => {
                                setcurrencyToWithdraw(coinBalance.currency!);
                                setisWithdrawModalActive(true)
                            }} />




                        </td>
                        <br />
                    </tr>

                </>
            )
        })
    }, [balances, currencies, t]);

    return (
        <StaticPagesLayout isDashboard={true} isLoading={(balancesLoading || currenciesLoading)}>
            <>
                <BFModalWindow title={'Deposit ' + currencyToDeposit} isOpen={isDepositModalActive} onClose={() => {
                    setisDepositModalActive(false)
                    setTimeout(() => setcurrencyToDeposit(undefined), 100)
                }}>
                    {currencyToDeposit === "INR" ?
                        <DepositINRModal currency={currencyToDeposit!} onClose={() => {
                            setisDepositModalActive(false)
                            setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                     
                        }} />
                        :
                        <DepositModal currency={currencyToDeposit!} onClose={() => {
                            setisDepositModalActive(false)
                            setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                        }} />

                    }
                </BFModalWindow>

                <BFModalWindow title={'Withdraw ' + currencyToWithdraw} keepBlurred={true} isOpen={isWithdrawModalActive} onClose={() => {
                    setisWithdrawModalActive(false)
                    setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                    LoadData()
                }}>
                    {currencyToWithdraw === "INR" ?
                        <WithdrawInr currency={currencyToWithdraw!} onClose={() => {
                            setisWithdrawModalActive(false)
                            setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                            LoadData()
                        }} />
                        :
                        <WithdrawModal currency={currencyToWithdraw!} onClose={() => {
                            setisWithdrawModalActive(false)
                            setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                            LoadData()
                        }} />

                    }


                </BFModalWindow>

                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}>My Assets</h1>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-striped" style={{ overflow: 'scroll' }}>
                        <thead>
                            <tr>
                                <th className='thFix stickyHeader tdFix-left noborder'>{!isMobile ? "Coin / Token / Asset" : "Currency"}</th>
                                <th className='thFix stickyHeader noborder'>Available</th>
                                {!isMobile && <th className='thFix stickyHeader noborder'>On Orders</th>}
                                <th className='thFix stickyHeader noborder'>Total</th>
                                <th className='thFix stickyHeader noborder'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RenderBalanceList()}
                        </tbody>
                    </table>
                </div>
            </>
        </StaticPagesLayout>
    );
}