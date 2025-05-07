import { ApiKey, CreateMerchantRequest, CreateTransactionRequest, CryptoCurrency, GenerateApiKeyRequest, GetApiMarketsCurrenciesResponse, Merchant, MerchantInformation, TransactionState, Type } from '../../../api-wrapper/api';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../html/BFInput';
import { FaCheck, FaExternalLinkAlt, FaEye, FaEyeSlash, FaFolderOpen, FaShoppingCart, FaTimesCircle } from 'react-icons/fa';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useReducer, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { ActionType } from '../../../store/actionTypes';
import { BFModalWindow } from '../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import { Logger } from '../../../Logger';
// import { RequestSettingsTokenOverlay } from './security/RequestSettingsTokenOverlay';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import { isMobile } from 'react-device-detect';
import { useCallback } from 'react';
import { useCryptoKeys } from '../../../hooks/useCryptoKeys';
import { RequestSettingsTokenOverlay } from '../../dashboard/settings/security/RequestSettingsTokenOverlay';
import { useParams } from 'react-router-dom';
import { ICurrency } from '../../../store/types';
import { DispacherBaseTypes } from '../../terminal';
// import Moment from 'moment';
// import { Tabs, TabList, Tab, TabPanel } from 'redoc/typings/common-elements';
import Moment from 'react-moment';
import { WithdrawModal } from '../../dashboard/wallet/WithdrawModal';
import { WithdrawMerchantModal } from './controls/WithdrawMerchantModal';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function MerchantPanel() {
    const {
        state: { settings },
        dispatch
    } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(true);
    const [merchants, setMerchants] = useState<Merchant[]>();
    const [isCreateApiKeyModalActive, setisCreateApiKeyModalActive] = useState(false);
    const [removeRequestMerchant, setremoveRequestApiKey] = useState<Merchant>();

    const [isKeysHidden, setisKeysHidden] = useState(true);

    const [removeMerchantName, setremoveMerchantName] = useState<string>();

    const { t } = useTranslation();

    let { merchantId } = useParams<{ merchantId: string }>();

    const [merchantInformation, setmerchantInformation] = useState<MerchantInformation>();

    const LoadData = () => {
        setisLoading(true)
        BitflexOpenApi.GatewayApi.apiVversionGatewayMerchantinformationGet("1.0", merchantId)
            .then(response => {
                setmerchantInformation(response.data);
            })
            .catch(Logger.Catch)
            .finally(() => setisLoading(false))
    }

    useEffect(() => {
        LoadData()

        BitflexOpenApi.MarketsApi.apiVversionMarketsCurrenciesGet("1.0").then(response => {
            localStorage.setItem('currencies', JSON.stringify(response.data));
            dispatch_currencies({ type: DispacherBaseTypes.INIT_LOAD, value: response.data });
        });
    }, []);


    const [currencies, dispatch_currencies] = useReducer((currencies: Array<GetApiMarketsCurrenciesResponse>, { type, value }): Array<GetApiMarketsCurrenciesResponse> => {
        const index = currencies.findIndex((item) => item.name === value.name);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                // setcurrenciesLoading(false)
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

    const [isConfirmationDialogActive, setisConfirmationDialogActive] = useState(false);
    const [isLoadingKeyCreation, setisLoadingKeyCreation] = useState(false);
    const [isApiLabelTextCorrect, setisApiLabelTextCorrect] = useState(false);

    const [isWithdrawModalActive, setisWithdrawModalActive] = useState(false);
    const [currencyToWithdraw, setcurrencyToWithdraw] = useState<GetApiMarketsCurrenciesResponse>();

    return (
        <StaticPagesLayout
            isDashboard={true}
            isLoading={isLoading}
            overlayElement={<RequestSettingsTokenOverlay onLoadingStart={setisLoading} onTokenReceive={token => {
                dispatch({
                    type: ActionType.SET_ACCOUNT_SETTINGS,
                    payload: token
                });
            }} />}
            isOverlayActive={settings == null || settings?.expiration! < Math.floor(Date.now() / 1000)}
        >
            <>

                <BFModalWindow isOpen={isConfirmationDialogActive} title={t('Confirm Merchant Revocation')} onClose={() => setisConfirmationDialogActive(false)}>
                    <div style={{ margin: isMobile ? 1 : 12, }}>
                        <label className={''} style={{ fontSize: 16 }}>Type "{removeRequestMerchant?.name}" in field below:</label>
                        <input className="input-inline-form" style={{ width: '100%', height: 32, fontSize: 14 }} onChange={e => setremoveMerchantName(e.target.value)} type="text" placeholder={removeRequestMerchant?.name || ""} />
                    </div>
                    <BFGradientButton buttonType={BFGradientButtonType.Destructive} text={t('Revoke Merchant')} onPress={() => {
                        if (removeMerchantName !== removeRequestMerchant?.name) {
                            alert(t("Merchant name mismatch"))
                            return;
                        }
                        // RemoveMerchant(removeRequestMerchant?.key)
                    }} />
                </BFModalWindow>

                <BFModalWindow title={'Withdraw ' + currencyToWithdraw?.name} keepBlurred={true} isOpen={isWithdrawModalActive} onClose={() => {
                    setisWithdrawModalActive(false)
                    setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                    LoadData()
                }}>
                    <WithdrawMerchantModal currency={currencyToWithdraw!} merchant={merchantInformation?.merchant!} onClose={() => {
                        setisWithdrawModalActive(false)
                        setTimeout(() => setcurrencyToWithdraw(undefined), 100)
                        LoadData()
                    }} />
                </BFModalWindow>


                <div className={'bf-dash-header'} style={{ position: 'relative' }}>
                    <h1 className={'bf-dashboard-title'}>{merchantInformation?.merchant?.name}</h1>
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'row' }}>
                        <button onClick={() => setisKeysHidden(!isKeysHidden)} className='btn btn-lg bf-login-button font-roboto' style={{ width: '80%', margin: 42 }}>
                            {!isKeysHidden ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'scroll' }}>
                    {(merchantInformation?.balance && currencies)
                        ? <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className='thFix stickyHeader tdFix-left noborder'><Trans>Currency</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Amount</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>#</Trans></th>

                                </tr>
                            </thead>
                            <tbody style={{ whiteSpace: 'nowrap' }}>
                                {merchantInformation?.balance?.map(key => {
                                    var currency = currencies.find((x: CryptoCurrency) => x.id === key.currencyId);
                                    console.log("currency", currency, currencies)
                                    return (
                                        <>
                                            <tr id={key.inserted!} style={{ fontSize: 12, height: 30 }}>
                                                <td className='tdFix tdFix-left'>{currency?.name}</td>
                                                <td className={isKeysHidden ? 'tdFix noselect' : 'tdFix'} style={{ filter: isKeysHidden ? 'blur(2px)' : '' }}>{key.amount}</td>
                                                <td className='tdFix' style={{ padding: 0 }}>
                                                    <BFGradientButton buttonType={BFGradientButtonType.DestructiveSmall} text={t('Withdraw')}
                                                        onPress={() => {
                                                            if (currency?.name) {
                                                                setcurrencyToWithdraw(currency);
                                                                setisWithdrawModalActive(true)
                                                            }

                                                        }} />
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })}
                            </tbody>
                        </table>
                        : <div>
                            <div style={styles.emptyList}>
                                <FaShoppingCart style={{ fontSize: 60, color: Colors.bitFlexGoldenColor, marginBottom: 15 }} />
                                <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                                    <Trans>You have no Merchant Payments</Trans>
                                </div>
                            </div>
                        </div>
                    }
                </div>

                <Tabs className='tabbable-custom dontDragMe'>
                    <TabList>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'><Trans>Deposits</Trans></Tab>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'><Trans>Withdrawals</Trans></Tab>
                    </TabList>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped scrollable-bf">
                                <thead>
                                    <tr>
                                        <th className='thFix stickyHeader tdFix-left noborder'><Trans>Coin / Token / Asset</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Amount</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Datetime (UTC)</Trans></th>
                                        {/* <th className='thFix stickyHeader noborder'><Trans>TxId / Hash</Trans></th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {merchantInformation?.deposits?.map(deposit => {
                                        var currencyIn = currencies.find(x => x.id === deposit.currencyId);
                                        if (currencyIn)
                                            return (
                                                <tr key={deposit.createdAt} style={{ fontSize: 12, height: 46 }}>


                                                    <td className='tdFix tdFix-left'>
                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                            <div>{(currencyIn && currencyIn.imageBase64) && <img alt="image1" style={{ maxHeight: 18, marginTop: 4, marginRight: 5 }} src={currencyIn.imageBase64} />}</div>
                                                            <div>{currencyIn.name}</div>
                                                        </div>
                                                    </td>

                                                    <td className='tdFix' style={{ color: Colors.bitFlexGreenColor }}>{deposit.amount!.toFixed(8)}</td>
                                                    <td className='tdFix'>
                                                        {deposit.state !== TransactionState.Payed
                                                            ? <div style={{ display: 'inline-flex' }}>
                                                                <div>Pending Deposit</div>
                                                            </div>
                                                            :
                                                            <Moment format="DD MMMM HH:mm:ss" unix tz="GMT">{Math.floor(new Date(deposit.createdAt!).getTime() / 1000)}</Moment>
                                                        }
                                                    </td>
                                                    {/* <td className='tdFix'><a href={deposit.blockExURL! + deposit.txId} target='_blank' rel='noopener noreferrer'>{deposit.txId?.substring(0, 16)}... <FaExternalLinkAlt /></a></td> */}
                                                </tr>
                                            )

                                        return <></>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>

                                        <th className='thFix stickyHeader noborder'><Trans>Amount</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Datetime (UTC)</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>TxId / Hash</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {merchantInformation?.withdarals?.map(widthrawal => {
                                        var currencyIn = currencies.find(x => x.id === widthrawal.currencyId);
                                        return (
                                            <tr key={widthrawal.txId} style={{ fontSize: 12, height: 46 }}>

                                                <td className='tdFix'>{widthrawal.amount!.toFixed(8)}</td>
                                                <td className='tdFix'><Moment format="DD MM HH:mm:ss" unix tz="GMT">{widthrawal.dateCreated!}</Moment></td>
                                                <td className='tdFix'><a href={currencyIn?.blockExplorerUrl + widthrawal.txId!} target='_blank' rel='noopener noreferrer'>{widthrawal.txId?.substring(0, 16)}... <FaExternalLinkAlt /></a></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                </Tabs>
            </>
        </StaticPagesLayout>
    );
}

const styles: StylesDictionary = {
    emptyList: {
        padding: 40,
        width: isMobile ? 'unset' : '40%', backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto', marginTop: '10%',
        textAlign: 'center',
    }
}
