/* eslint-disable jsx-a11y/alt-text */
import 'moment-timezone';

import { BFGradientButton, BFGradientButtonType, } from '../../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../../html/BFInput';
import { BFNotification, IBFNotification } from '../../../html/BFNotification';
import { Code, GatewayApi, GetApiMarketsCurrenciesResponse, GuardActionType, Merchant } from '../../../../api-wrapper/api';
import { ICurrency, IState } from '../../../../store/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import Colors from '../../../../Colors';
import Countdown from 'react-countdown';
import { GetWithdrawResponse } from '../../../../api-wrapper';
import { Store } from '../../../../store';
import check from '../../../../images/check.png'
import cross from '../../../../images/cross.png'
import { isMobile } from 'react-device-detect';
import loading_png from '../../../../images/loading.svg';
import { useTranslation } from 'react-i18next';
const md5 = require('js-md5');

export function WithdrawMerchantModal({
    currency,
    merchant,
    onClose
}: {
    currency: GetApiMarketsCurrenciesResponse,
    merchant: Merchant,
    onClose: Function
}) {

    const { currencies } = React.useContext(Store).state as IState;

    const { t } = useTranslation();

    // var [currencyData, setCurrencyData] = useState<ICurrency>();

    const [withdrawPage, setWithdrawPage] = useState<GetWithdrawResponse>();

    const [withdrawAmountForm, setwithdrawAmountForm] = useState(0)

    const [destinationTag, setDestinationTag] = useState('');
    const [receiveWithdrawAmount, setreceiveWithdrawAmount] = useState(0)

    const [withdrawAddress, setwithdrawAddress] = useState<string>()

    const [feeCalc, setfeeCalc] = useState(0)

    const [formAmountValue, setformAmountValue] = useState<string>()

    const divRef = useRef<HTMLDivElement>(null);

    const [guardResult, setguardResult] = useState<boolean>();

    const [guardProceeded, setguardProceeded] = useState(false);


    const [isAddressValid, setisAddressValid] = useState(false);
    const [isAmountValid, setisAmountValid] = useState(false);

    let BFNotifictionRef = useRef<IBFNotification>(null);

    if (!currency) return (
        <div style={{ textAlign: "center" }}>
            <img className="widget-thumb-icon" src={loading_png} alt="Loading" style={{ top: 50 }} />
        </div>
    );

    return (
        <>
            <BFNotification ref={BFNotifictionRef} />
            <div className="row bf-row" style={{ position: 'relative' }} ref={divRef}>
                <div>
                    <label style={{ width: '100%', display: 'inline-flex', justifyContent: 'space-between' }}>
                        <div>AMOUNT TO WITHDRAW</div>
                        {/* <div style={{ float: 'right', color: 'whitesmoke' }}>AVAILABLE: <b onClick={() => { setformAmountValue(withdrawPage.availableAmount?.toString()) }} style={{ color: 'white', borderBottom: '1px dashed white', cursor: 'pointer' }}>{withdrawPage.availableAmount}</b> {currency.symbol!}</div> */}
                    </label>
                    <div className="form-group">
                        <BFInput
                            type={BFInputType.Decimal}
                            leftsideSymbol={currency.symbol!}
                            onValue={setwithdrawAmountForm}
                            setValue={formAmountValue}
                            onValidated={setisAmountValid}
                        // maxValue={withdrawPage.availableAmount}
                        />
                    </div>
                    <label>WITHDRAW TO ADDRESS</label>
                    <div className="form-group">
                        <BFInput
                            type={BFInputType.CryptoAddress}
                            onValue={e => {
                                setwithdrawAddress(e)
                                console.log(e)
                            }}
                            setValue={withdrawAddress}
                            hasBlockieImage={true}
                            minStringLength={16}
                            maxStringLength={128}
                            onValidated={setisAddressValid}
                        />
                    </div>
                    {/* <div style={{ color: 'whitesmoke', textAlign: 'right' }}>Total Fee: <b>{withdrawPage.withdrawFee} {currency.symbol}</b></div> */}
                    {/* <div style={{ color: 'whitesmoke', textAlign: 'right' }}>You will receive: <b>{withdrawAmountForm > 0 ? receiveWithdrawAmount.toFixed(8) : 0.0.toFixed(8)} {currency.symbol}</b></div> */}

                    <div style={{ float: 'left', width: '100%', display: 'flex', marginBottom: 15 }}>
                        <BFGradientButton
                            buttonType={BFGradientButtonType.Action}
                            text={t('WITHDRAW')}
                            width={200}
                            // requireTwoStep={true}
                            twoStepOverlayDiv={divRef!}

                            isDisabled={!isAmountValid || !isAddressValid}


                            // postWithdrawRequest={{ address: withdrawAddress!, amount: withdrawAmountForm!, currency: currency.name!, googleAuthenticatorCode: '' }}

                            onClose={onClose}

                            BFNotificationRef={BFNotifictionRef.current!}

                            onPress={() => {
                                BitflexOpenApi.GatewayApi.apiGatewayWithdrawPost({
                                    merchantId: merchant.id,
                                    destinationAddress: withdrawAddress!,
                                    amount: withdrawAmountForm!,
                                    currencyId: currency.id,
                                    checksum: md5(withdrawAddress! + withdrawAmountForm! + merchant.id + merchant.key)
                                })
                                    .finally(() => onClose())
                            }}
                        />
                    </div>
                </div>

            </div>
        </>
    );
}