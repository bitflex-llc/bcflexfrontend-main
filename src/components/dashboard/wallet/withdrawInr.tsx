import 'moment-timezone';

import { BFGradientButton, BFGradientButtonType, } from '../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../html/BFInput';
import { BFNotification, IBFNotification } from '../../html/BFNotification';
import { Code, GuardActionType, INRBanks } from '../../../api-wrapper/api';
import { ICurrency, IState } from '../../../store/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import Countdown from 'react-countdown';
import { GetWithdrawResponse } from '../../../api-wrapper';
import { Store } from '../../../store';
import check from '../../../images/check.png'
import cross from '../../../images/cross.png'
import { isMobile } from 'react-device-detect';
import loading_png from '../../../images/loading.svg';
import { useTranslation } from 'react-i18next';
import { FaDotCircle } from 'react-icons/fa';

import HDFC from '../../../images/HDFC-Bank-Limited-Symbol.png'
import UPI_QR from '../../../images/qr-code_upi2.png'
import UPI from '../../../images/upi_logo_icon_169316.webp'

export function WithdrawInr({
    currency,
    onClose
}: {
    currency: string,
    onClose: () => void
}): JSX.Element {

    const { currencies } = React.useContext(Store).state as IState;

    const { t } = useTranslation();

    const [currencyData, setCurrencyData] = useState<ICurrency>();

    const [withdrawPage, setWithdrawPage] = useState<GetWithdrawResponse>();

    const [withdrawAmountForm, setwithdrawAmountForm] = useState(0)

    const [destinationTag, setDestinationTag] = useState('');
    const [receiveWithdrawAmount, setreceiveWithdrawAmount] = useState(0)

    // const [withdrawAddress, setwithdrawAddress] = useState<string>()

    const [userBankName, setUserBankName] = useState<string>();
    const [userBankAccountNumber, setUserBankAccountNumber] = useState<string>();
    const [userIFSC, setUserIFSC] = useState<string>();

    const [UPIID, setUPIID] = useState<string>();

    const [feeCalc, setfeeCalc] = useState(0)

    const [formAmountValue, setformAmountValue] = useState<string>()

    const divRef = useRef<HTMLDivElement>(null);

    const [guardResult, setguardResult] = useState<boolean>();

    const [guardProceeded, setguardProceeded] = useState(false);

    const [bankName, setBankName] = useState<INRBanks>();

    const calculate = useCallback(() => {
        if (!withdrawPage || withdrawPage === undefined) return;

        const withdrawCalculated = withdrawAmountForm - (withdrawAmountForm * withdrawPage.withdrawFeePercent! / 100) - withdrawPage.withdrawFee!;
        const feeIn = withdrawAmountForm - withdrawCalculated;

        const wAmount = isNaN(withdrawCalculated) ? 0 : Math.max(withdrawCalculated, 0);
        if (wAmount > 0)
            setfeeCalc(Math.max(feeIn, 0));
        setreceiveWithdrawAmount(wAmount)
    }, [withdrawAmountForm, withdrawPage])

    const [isAddressValid, setisAddressValid] = useState(false);
    const [isAmountValid, setisAmountValid] = useState(false);

    const BFNotifictionRef = useRef<IBFNotification>(null);

    const [isAddressDropdownActive, setisAddressDropdownActive] = useState(false);

    const [currencyNetworkId, setCurrencyNetworkId] = useState(0);

    const [bankAccountValidated, setbankAccountValidated] = useState(false);
    const [bankNameValidated, setbankNameValidated] = useState(false);
    const [bankIFSCCode, setbankIFSCCode] = useState(false);

    const renderer = ({ days, hours, minutes, seconds }) => {

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }

        return <span>{days} days, {hours}:{minutes}:{seconds}</span>;

    };

    useEffect(() => {
        calculate();
    }, [calculate, withdrawAmountForm]);

    const BankSelector = useCallback(({ isChecked, setChecked, label, image }): JSX.Element => {
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


    useEffect(() => {
        setCurrencyData(currencies.find(x => x.symbol === currency))
        BitflexOpenApi.BalanceApi.apiVversionBalanceWithdrawCurrencyPageGet(currency, "1.0").then(response => {
            setWithdrawPage(response.data);
        }).catch((error) => {
            console.log('error ' + error);
        });
    }, [currencies, currency])

    if (!withdrawPage || !currencyData) return (
        <div style={{ textAlign: "center" }}>
            <img className="widget-thumb-icon" src={loading_png} alt="Loading" style={{ top: 50 }} />
        </div>
    );

    if (!withdrawPage.errorCode?.success && withdrawPage?.errorCode?.errorCode === Code.Locked) return (
        <div style={{ textAlign: "center" }}>
            <h3>Withdrawals are locked for this account</h3>
            <h4>Unlock in: <Countdown
                daysInHours={true}
                date={parseInt(withdrawPage?.errorCode?.errorMessage!) * 1000}
                renderer={renderer}
            /></h4>
        </div>
    );

    if (!withdrawPage.errorCode?.success && withdrawPage?.errorCode?.errorCode === Code.TwoFactorRequired) return (
        <div style={{ textAlign: "center" }}>
            <h3>Two Step Verification is required for withdrawals.</h3>
            <h3><BFGradientButton buttonType={BFGradientButtonType.Green} isLinkButton to={'/settings/security'} text={t('Enable Two Step Verification')} width={isMobile ? '80%' : '50%'} /></h3>
        </div>
    );


    return (
        <>
            <BFNotification ref={BFNotifictionRef} />
            <div className="row bf-row" style={{ position: 'relative' }} ref={divRef}>

                <h4 style={{ marginTop: -15, marginBottom: 7 }}>Select Type</h4>

                <BankSelector
                    isChecked={bankName == INRBanks.Hdfc}
                    setChecked={() => setBankName(INRBanks.Hdfc)}
                    label={"HDFC Bank"}
                    image={HDFC}
                />

                <BankSelector
                    isChecked={bankName == INRBanks.Upi}
                    setChecked={() => setBankName(INRBanks.Upi)}
                    label={"UPI"}
                    image={UPI}
                />

                {/* const [userBankName, setUserBankName] = useState<string>();
    const [userBankAccountNumber, setUserBankAccountNumber] = useState<string>();
    const [userIFSC, setUserIFSC] = useState<string>(); */}

                {bankName == INRBanks.Hdfc &&
                    <>
                        <div>
                            <label style={{ width: '100%', display: 'inline-flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0 }}>Amount</h4>
                                <div style={{ float: 'right', color: 'whitesmoke' }}>
                                    AVAILABLE: <b onClick={() => {
                                        setformAmountValue(withdrawPage.availableAmount?.toString())
                                        setisAmountValid(true)
                                        withdrawPage.availableAmount && setwithdrawAmountForm(withdrawPage.availableAmount)

                                    }} style={{ color: 'white', borderBottom: '1px dashed white', cursor: 'pointer' }}>{withdrawPage.availableAmount}</b> {currencyData.symbol}
                                </div>
                            </label>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Decimal}
                                    leftsideSymbol={currencyData.symbol}
                                    onValue={setwithdrawAmountForm}
                                    setValue={formAmountValue}
                                    onValidated={setisAmountValid}
                                    maxValue={withdrawPage.availableAmount}
                                />
                            </div>
                            <h4 style={{ marginBottom: 5 }}>Bank Name:</h4>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Text}
                                    onValue={(e: React.SetStateAction<string | undefined>) => {
                                        setUserBankName(e)
                                    }}
                                    setValue={userBankName}
                                    onValidated={setbankNameValidated}
                                />
                            </div>

                            <h4 style={{ marginBottom: 5 }}>Bank Account:</h4>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Text}
                                    onValue={(e: React.SetStateAction<string | undefined>) => {
                                        setUserBankAccountNumber(e)
                                    }}
                                    setValue={userBankAccountNumber}
                                />
                            </div>

                            <h4 style={{ marginBottom: 5 }}>IFSC Code:</h4>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Text}
                                    onValue={(e: React.SetStateAction<string | undefined>) => {
                                        setUserIFSC(e)
                                    }}
                                    setValue={userIFSC}
                                />
                            </div>

                            <div style={{ color: 'whitesmoke', textAlign: 'right' }}>Total Fee: <b>{withdrawPage.withdrawFee} {currencyData.symbol}</b></div>
                            <div style={{ color: 'whitesmoke', textAlign: 'right' }}>You will receive: <b>{withdrawAmountForm > 0 ? receiveWithdrawAmount.toFixed(8) : 0.0.toFixed(8)} {currencyData.symbol}</b></div>

                            <div style={{ float: 'left', width: '100%', display: 'flex', marginBottom: 15 }}>
                                {withdrawPage && <BFGradientButton
                                    buttonType={BFGradientButtonType.GoldenBorder}
                                    text={t('WITHDRAW TO BANK')}
                                    width={200}
                                    twoStepOverlayDiv={divRef}

                                    isDisabled={!isAmountValid}
                                    onClose={onClose}
                                    onPress={() => {
                                        BitflexOpenApi.BalanceApi.apiBalanceManualWithdrawRequestPost({
                                            amount: withdrawAmountForm,
                                            bankAccountNumber: userBankAccountNumber,
                                            bankName: bankName,
                                            ifscCode: userIFSC,
                                            bankType: INRBanks.Hdfc,
                                            currencyId: 11
                                        }).then(onClose)
                                    }}

                                    BFNotificationRef={BFNotifictionRef.current!}
                                />
                                }
                            </div>
                        </div>
                    </>
                }

                {bankName == INRBanks.Upi &&
                    <>
                        <div>
                            <label style={{ width: '100%', display: 'inline-flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0 }}>Amount</h4>
                                <div style={{ float: 'right', color: 'whitesmoke' }}>
                                    AVAILABLE: <b onClick={() => {
                                        setformAmountValue(withdrawPage.availableAmount?.toString())
                                        setisAmountValid(true)
                                        withdrawPage.availableAmount && setwithdrawAmountForm(withdrawPage.availableAmount)

                                    }} style={{ color: 'white', borderBottom: '1px dashed white', cursor: 'pointer' }}>{withdrawPage.availableAmount}</b> {currencyData.symbol}
                                </div>
                            </label>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Decimal}
                                    leftsideSymbol={currencyData.symbol}
                                    onValue={setwithdrawAmountForm}
                                    setValue={formAmountValue}
                                    onValidated={setisAmountValid}
                                    maxValue={withdrawPage.availableAmount}
                                />
                            </div>
                            <h4 style={{ marginBottom: 5 }}>UPI ID:</h4>
                            <div className="form-group">
                                <BFInput
                                    type={BFInputType.Text}
                                    onValue={(e: React.SetStateAction<string | undefined>) => {
                                        setUPIID(e)
                                    }}
                                    setValue={UPIID}
                                />
                            </div>



                            <div style={{ color: 'whitesmoke', textAlign: 'right' }}>Total Fee: <b>{withdrawPage.withdrawFee} {currencyData.symbol}</b></div>
                            <div style={{ color: 'whitesmoke', textAlign: 'right' }}>You will receive: <b>{withdrawAmountForm > 0 ? receiveWithdrawAmount.toFixed(8) : 0.0.toFixed(8)} {currencyData.symbol}</b></div>

                            <div style={{ float: 'left', width: '100%', display: 'flex', marginBottom: 15 }}>
                                {withdrawPage && <BFGradientButton
                                    buttonType={BFGradientButtonType.GoldenBorder}
                                    text={t('WITHDRAW UPI')}
                                    width={200}
                                    twoStepOverlayDiv={divRef}

                                    isDisabled={!isAmountValid}
                                    onClose={onClose}
                                    onPress={() => {
                                        BitflexOpenApi.BalanceApi.apiBalanceManualWithdrawRequestPost({
                                            amount: withdrawAmountForm,
                                            upiid: UPIID,
                                            bankType: INRBanks.Upi,
                                            currencyId: 11
                                        }).then(onClose)
                                    }}

                                    BFNotificationRef={BFNotifictionRef.current!}
                                />
                                }
                            </div>
                        </div>
                    </>
                }



            </div>
        </>
    );
}