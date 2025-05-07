import 'moment-timezone';

import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../html/BFNotification';
import { GetAddressResponse } from '../../../api-wrapper';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { FaDotCircle, FaWallet } from 'react-icons/fa';
import { ICurrency } from '../../../store/types';
import { Store } from '../../../store';
import loading_png from '../../../images/loading.svg';

import { QRCodeSVG } from 'qrcode.react';
import Colors from '../../../Colors';

export function DepositModal({
    currency,
    onClose
}: {
    currency: string,
    onClose: Function
}) {
    const {
        state: { currencies } } = React.useContext(Store);

    var [depositParam, setDepositParam] = useState<GetAddressResponse>();
    var [currencyData, setCurrencyData] = useState<ICurrency>();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const [isLoading, setisLoading] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const [currencyNetworkId, setCurrencyNetworkId] = useState(0);

    useEffect(() => {
        setCurrencyData(currencies.find(x => x.symbol === currency))
        BitflexOpenApi.BalanceApi.apiVversionBalanceDepositCurrencyAddressGet(currency, "1.0").then(response => {
            setDepositParam(response.data);
        }).catch((error) => {
            console.log('apiVversionBalanceDepositCurrencyAddressGet', error);
            BFNotifictionRef.current?.Notify(t('Loading Error'), "We are expecting some technical difficulties. Try again later.", BFNotificationType.Error);
        });
    }, [currencies, currency, t])

    const handleFocus = (event: { target: { select: () => any; }; }) => event.target.select();

    const NetworkSelector = useCallback(({ isChecked, setChecked, label, image }): JSX.Element => {
        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => setChecked(!isChecked)}>
            <div style={{
                marginBottom: 10, background: 'transparent', borderRadius: 5,
                padding: isChecked ? 12 : 13, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: isChecked ? 2 : 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGoldenColor : Colors.BITFLEXBorder
            }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img alt="image1" style={{ maxHeight: 32, marginTop: 0, marginRight: 0 }} src={image} />
                    <div style={{ marginLeft: 11, fontSize: 20, color: 'rbga(255,255,255,0.8)' }}>{label}</div>
                </div>
                <div>
                    <FaDotCircle style={{ fontSize: 25, color: isChecked ? Colors.bitFlexGoldenColor : 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                </div>
            </div>
        </div>
    }, []);

    function handleEvent() {
        setisLoading(true)

        BitflexOpenApi.BalanceApi.apiVversionBalanceDepositCurrencyAddressPost(currency, "1.0")
            .then(response => {
                if (response.data.result)
                    setDepositParam(response.data.depositParam)
                else
                    BFNotifictionRef.current?.Notify(t('Generation Error'), "We are expecting some technical difficulties. Try again later.", BFNotificationType.Error);

            })
            .catch((error) => {
                console.log('apiVversionBalanceDepositCurrencyAddressPost', error);
                BFNotifictionRef.current?.Notify(t('Generation Error'), "We are expecting some techincal issues with " + currencyData?.name + " wallet. Watch for our social channels for updates or try again in 15 minutes.", BFNotificationType.Error);
            })
            .finally(() => {
                setisLoading(false)
            })
    };

    if (!depositParam)
        return (
            <div style={{ textAlign: "center" }}>
                <img className="widget-thumb-icon" src={loading_png} alt="Loading" style={{ top: 50 }} />
            </div>
        );
    return (
        <div className="row bf-row" ref={divRef}>
            <BFNotification ref={BFNotifictionRef} />
            {!depositParam.isAddressGenerated
                ? <>
                    <h1 className="font-green-sharp" style={{ textAlign: 'center' }}><FaWallet /></h1>
                    <h1 className={'bf-dashboard-title'}> Deposit address generation</h1>
                    <h3 style={{ textAlign: 'center', paddingRight: '5%', paddingLeft: '5%' }}>We will generate deposit address for <span style={{ color: '#cf8900' }}>{currencyData?.name}</span>. This address is lifetime, generated only once and can't be changed. Each time, double check your input data when sending funds. Wrong address may result complete coins loss.</h3>
                    <br />
                    <div style={{ textAlign: 'center' }}>
                        <BFGradientButton isLoading={isLoading} buttonType={BFGradientButtonType.GoldenBorder} width={'50%'} text={t('Agree. Generate address')} onPress={handleEvent} />
                    </div>
                </>
                : <>
                    {depositParam.networkCurrencies && depositParam.networkCurrencies?.length > 0
                        ?
                        <>
                            <h3 style={{ marginTop: -15 }}>Select Network</h3>
                            {depositParam.networkCurrencies.map((network) => {
                                return <NetworkSelector
                                    isChecked={currencyNetworkId === network.networkCurrencyId}
                                    setChecked={() => setCurrencyNetworkId(network.networkCurrencyId!)}
                                    label={network.name}
                                    image={network.imageBase64}
                                />
                            })}
                            {currencyNetworkId > 0 &&
                                <>
                                    <div className="col-lg-3" style={{ textAlign: 'center', marginTop: 10, overflow: 'hidden' }}>
                                        {depositParam.networkCurrencies && <QRCodeSVG value={depositParam.networkCurrencies.find(_ => _.networkCurrencyId === currencyNetworkId)?.adreess!} size={350} bgColor={'transparent'} fgColor={'whitesmoke'} />}
                                    </div>
                                    <div className="col-lg-9" style={{ padding: 0 }}>
                                        <h3>Your Deposit Address</h3>
                                        <div className="form-group">
                                            <table className="form-table">
                                                <tbody>
                                                    <tr>
                                                        <td style={{ width: '80%' }}>
                                                            <input type="text" className="input-inline-form maxwidth height45" onFocus={handleFocus} value={depositParam.networkCurrencies.find(_ => _.networkCurrencyId === currencyNetworkId)?.adreess!} style={{ cursor: 'text', fontSize: 15 }} />
                                                        </td>
                                                        <td>&nbsp;</td>
                                                        <td style={{ width: '20%' }}>
                                                            <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text={t('COPY')} onPress={() => {
                                                                if (depositParam && depositParam.networkCurrencies) {
                                                                    navigator.clipboard.writeText(depositParam.networkCurrencies.find(_ => _.networkCurrencyId === currencyNetworkId)?.adreess!)

                                                                    BFNotifictionRef.current?.Notify("Success", "Copied", BFNotificationType.Success)
                                                                }
                                                            }} />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <span></span>
                                            <div style={{ border: '1px dashed red', borderRadius: 5, marginTop: 10, fontSize: 16 }}><p style={{ paddingLeft: 5, margin: 5 }}>Minimum Deposit: {depositParam.minimumDeposit?.toFixed(8)} {depositParam.currency}</p></div>
                                            <span className="help-inline">Deposit will proceed after {depositParam.confirmationCount} confirmations</span>
                                        </div>
                                        <h5 style={{ color: 'whitesmoke', padding:5 }}>1. Double check address or better use "Copy" button</h5>
                                        <h5 style={{ color: 'whitesmoke', padding:5 }}>2. Mistake in address may cause unrecoverable coins loss</h5>
                                    </div>
                                </>
                            }
                        </>
                        : <>
                            <div className="row bf-row" style={{ margin: 5 }}>
                                <div className="col-lg-3" style={{ textAlign: 'center', marginTop: -30, overflow: 'hidden' }}>
                                    {depositParam.address && <QRCodeSVG value={depositParam.address} size={350} bgColor={'transparent'} fgColor={'whitesmoke'} />}
                                </div>
                                <div className="col-lg-9" style={{ padding: 0 }}>
                                    <h3>Your Deposit Address</h3>
                                    <div className="form-group">
                                        <table className="form-table">
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '80%' }}>
                                                        <input type="text" className="input-inline-form maxwidth height45" onFocus={handleFocus} value={depositParam.address!} style={{ cursor: 'text', fontSize: 15 }} />
                                                    </td>
                                                    <td>&nbsp;</td>
                                                    <td style={{ width: '20%' }}>
                                                        <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text={t('COPY')} onPress={() => {
                                                            navigator.clipboard.writeText(depositParam!.address!)

                                                            BFNotifictionRef.current?.Notify("Success", "Copied", BFNotificationType.Success)
                                                        }} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <span></span>
                                        <div style={{ border: '1px dashed red', borderRadius: 5, marginTop: 10, fontSize: 16 }}><p style={{ paddingLeft: 5, margin: 5 }}>Minimum Deposit: {depositParam.minimumDeposit?.toFixed(8)} {depositParam.currency}</p></div>
                                        <span className="help-inline">Deposit will proceed after {depositParam.confirmationCount} confirmations</span>
                                    </div>
                                    <p style={{ color: 'whitesmoke' }}>1. Double check address or better use "Copy" button</p>
                                    <p style={{ color: 'whitesmoke' }}>2. Mistake in address may cause unrecoverable coins loss</p>
                                </div>
                            </div>
                        </>}
                </>
            }
        </div>
    );
}