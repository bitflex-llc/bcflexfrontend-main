import '../../css/signlayout.css';

import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { Link, useParams } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useState } from 'react';
import Colors from '../../Colors';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { ApiPaymentPage, TransactionState } from '../../api-wrapper';
import { FaBan, FaCheck, FaClock, FaCopy } from 'react-icons/fa';
import Countdown from 'react-countdown';
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import ProgressBar from 'react-customizable-progressbar'
import { LoadingComponent } from '../LoadingComponent';

import FlexPayLogo_Color from '../../images/flex_pay_color.svg';

import Web3 from 'web3';
import confetti from 'canvas-confetti';
import { BFInput, BFInputType } from '../html/BFInput';
import React from 'react';

import cross from '../../images/cross.png'
import ok from '../../images/check.png'
import { BFModalWindow } from '../html/BFModalWindow';

import { QRCodeSVG } from 'qrcode.react';

const renderer = ({ minutes, seconds }) => {
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return <>{minutes}:{seconds}</>;
};

// var QRCode = require('qrcode.react');

const toShort = (value: string, factor: number = 5) => {
    const slice = Math.round(value.length / factor)
    return `${value.substr(0, slice)}...${value.substr(value.length - slice, value.length)}`
}

export { toShort }

export default function Paymentgateway() {

    let { transactionId } = useParams<{ transactionId: string }>();
    let BFNotifictionRef = useRef<IBFNotification>(null);

    const { t } = useTranslation();

    const [isWaitingForConfirmation, setisWaitingForConfirmation] = useState(false);
    const [result, setResult] = useState<TransactionState | undefined>(undefined);

    const [paymentPageData, setpaymentPageData] = useState<ApiPaymentPage>()
    const [confirmationsNumber, setconfirmationsNumber] = useState<number>(0);
    const [wssConnected, setwssConnected] = useState(false);

    const [isFault, setIsFault] = React.useState(false);

    const [email, setemail] = useState<string>();
    const [isEmailValid, setisEmailValid] = useState(false);

    const [cashbackModalActive, setcashbackModalActive] = useState(false);

    const [isCasbbackButtonLoading, setisCasbbackButtonLoading] = useState(false);

    const UpdateTransaction = () => {
        BitflexOpenApi.GatewayApi.apiVversionGatewayTransactionGet("1.0", transactionId)
            .then(data => setpaymentPageData(data.data))
        // .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        UpdateTransaction()

        setInterval(UpdateTransaction, 5000)
    }, []);

    const [redirectBackQuery, setredirectBackQuery] = useState<string>();

    // const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-mainnet.core.chainstack.com/2d56bc435bb7400ccdb197e25b425467'));

    useEffect(() => {
        if (!paymentPageData) return;
        if (paymentPageData.transaction?.state === TransactionState.PendingConfirmations) {
            setTimeout(() => {
                setcashbackModalActive(true)
            }, 4000)
        }
    }, [paymentPageData]);

    useEffect(() => {
        if (!paymentPageData) return;

        const redirectBackParams = new URLSearchParams();
        redirectBackParams.append("orderId", paymentPageData?.transaction?.orderId!);
        redirectBackParams.append("transactionId", paymentPageData?.transaction?.id!);
        setredirectBackQuery("?" + redirectBackParams.toString())
        setResult(paymentPageData.transaction?.state)


        // var subscription = web3.eth.subscribe('logs', {
        //     address: '0x123456..',
        //     topics: ['0x12345...']
        // },).then((error, result)=>{

        // })

        // .on("connected", function(subscriptionId){
        //     console.log(subscriptionId);
        // })
        // .on("data", function(log){
        //     console.log(log);
        // })
        // .on("changed", function(log){
        // });

        // if (paymentPageData.depositAddress?.address) {
        //     web3.eth.subscribe('logs', {
        //         address: paymentPageData.depositAddress.address,
        //         // topics: ['0x12345...']
        //     }).then(result => {
        //         // result.on("connected", function (subscriptionId) {
        //             setwssConnected(true)
        //         // })
        //         result.on("data", function (log) {
        //             console.log(log);
        //         })
        //     })
        // }

        // web3.eth.subscribe('logs', { address: paymentPageData.depositAddress}, function (error, result) {
        //     if (!error) {
        //         return;
        //     }
        //     console.error(error);
        // }).then(connection => {
        //     setwssConnected(true)
        //     connection.on("connected", function (subscriptionId) {
        //         // console.log("connection")
        //         // setwssConnected(true)
        //     })
        //     connection.on("data", function (pendingTransaction) {
        //         console.log(pendingTransaction);
        //         web3.eth.getTransaction(pendingTransaction).then(rawTransaction => {
        //             if (rawTransaction.to === paymentPageData.depositAddress?.address) {
        //                 connection.unsubscribe();
        //                 setTimeout(() => {
        //                     setcashbackModalActive(true)
        //                 }, 4000)
        //                 setisWaitingForConfirmation(true)
        //                 StartConfirmationTimer(rawTransaction.hash, paymentPageData.currency?.confirmationCount)
        //             }
        //         })
        //     })
        //     connection.on("error", console.error);
        // })
    }, [paymentPageData]);

    // const StartConfirmationTimer = (txId: string, requiredConfirmations) => {
    //     let timerId = setInterval(async () => {
    //         var blockNumber = await web3.eth.getBlockNumber();
    //         var transaction = await web3.eth.getTransaction(txId);
    //         if (transaction.blockNumber) {
    //             var confirmations = parseInt(blockNumber.toString()) - parseInt(transaction.blockNumber);
    //             console.log("confirmations:, requred", parseInt(blockNumber.toString()) - parseInt(transaction.blockNumber), requiredConfirmations);
    //             if (confirmations === requiredConfirmations) {
    //                 clearInterval(timerId)
    //                 setTimeout(() => {
    //                     setcashbackModalActive(true)
    //                 }, 4000)
    //                 setisWaitingForConfirmation(false)
    //                 setResult(TransactionState.ProjectOkAwait)
    //             }
    //             setconfirmationsNumber(confirmations)
    //         }
    //     }, 1000);
    // }

    const FaultView = () => {
        return <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ padding: 20 }}>

                <img src={cross} width={'60%'} alt='failed payment' />
            </div>
            <p style={{ fontSize: 19 }}>Payment Failed</p>
            <BFGradientButton width={150} text='Back to Merchant' buttonType={BFGradientButtonType.Destructive} onPress={() => {
                if (paymentPageData?.faultUrl)
                    window.location.replace(paymentPageData.faultUrl + redirectBackQuery)
            }} />
        </div>
    }

    const SuccessView = () => {
        confetti({
            particleCount: 125,
            spread: 90,
            origin: { y: 0.6 }
        });

        return <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ padding: 20 }}>
                <img src={ok} width={'60%'} alt='failed payment' />
            </div>
            <p style={{ fontSize: 20 }}>Payment Successful</p>
            {/* <BFGradientButton to='http://yandex.ru' width={150} isLinkButton={true} text='View Reciept' buttonType={BFGradientButtonType.Green}/> */}
            <BFGradientButton width={150} text='Back to Merchant' buttonType={BFGradientButtonType.Shadow} onPress={() => {
                if (paymentPageData?.successUrl)
                    window.location.replace(paymentPageData.successUrl + redirectBackQuery)
            }} />
        </div>
    }

    const OkAwaiting = () => {
        return <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ marginTop: -30, marginBottom: -30 }}><LoadingComponent /></div>
            <p style={{ fontSize: 18 }}>Confirmations arrived.<br /><br />Waiting for merchant to complete the transaction.</p>
        </div>
    }

    const Loading = () => {
        return <div style={{ textAlign: 'center', padding: 30 }}>
            <div style={{ marginTop: -30, marginBottom: -30 }}><LoadingComponent /></div>
            <p style={{ fontSize: 19 }}>Loading...</p>
        </div>
    }

    const WaitingForConfirmationsView = () => {
        return <div style={{ textAlign: 'center', padding: 30 }}>
            <ProgressBar
                progress={confirmationsNumber}
                steps={paymentPageData?.currency?.confirmationCount}
                radius={60}
                className='your-indicator'

                strokeColor={Colors.bitFlexGreenColor}
                trackStrokeColor={'rgba(74,89,105,0.075)'}

                children={<p style={{ fontSize: 18 }}>{confirmationsNumber}/{paymentPageData?.currency?.confirmationCount} Confirmations</p>}
            />

            <div style={{ marginTop: -30, marginBottom: -30 }}><LoadingComponent /></div>
            <p style={{ fontSize: 18 }}>Payment arrived. Now relax, we are waiting for {paymentPageData?.currency?.confirmationCount} confirmations.</p>
        </div>
    }

    const PaymentView = () => {
        return <>
            <div>
                <div style={{ textAlign: 'center', padding: 10 }}>
                    {<QRCodeSVG imageSettings={{
                        src: paymentPageData?.currency?.image!,
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                    }} value={'ethereum:' + paymentPageData?.depositAddress?.address} size={isMobile ? 300 : 360} bgColor={'transparent'} fgColor={'white'} />}
                </div>
                <div style={{ paddingTop: 20, paddingBottom: 20, }}>
                    <div>Merchant</div>
                    <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600 }}>{paymentPageData?.merchantName}</div>
                    </div>
                </div>
                <div>
                    <div>Amount</div>
                    <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600 }}>
                            <span style={{ color: Colors.bitflexGolderColor2 }}>{paymentPageData?.transaction?.amount?.toFixed(8)} {paymentPageData?.currency?.shortName}</span>
                            &nbsp;
                            {/* (<span style={{ color: Colors.bitFlexGreenColor }}>± {GetUsdPrice()} USD</span>) */}
                        </div>
                        <div><FaCopy onClick={() => {
                            if (paymentPageData?.transaction?.amount) {
                                navigator.clipboard.writeText(paymentPageData.transaction.amount.toFixed(8))
                                BFNotifictionRef.current?.Notify(t('Success'), t('Amount Copied'), BFNotificationType.Success);
                            }
                        }} /></div>
                    </div>
                    <div style={{ border: '1px dashed red', borderRadius: 5, marginTop: 10 }}><p style={{ paddingLeft: 10, margin: 5 }}>Send the <span style={{ color: Colors.bitFlexRedColor }}>EXACT</span> amount above to complete your purchase</p></div>
                </div>
                <div style={{ paddingTop: 20, paddingBottom: 20, }}>
                    <div>{paymentPageData?.currency?.name} address</div>
                    <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 600 }}>{paymentPageData?.depositAddress?.address && toShort(paymentPageData.depositAddress.address, 4)}</div>
                        <div><FaCopy onClick={() => {
                            if (paymentPageData?.depositAddress?.address) {
                                navigator.clipboard.writeText(paymentPageData.depositAddress.address)
                                BFNotifictionRef.current?.Notify(t('Success'), t('Address Copied'), BFNotificationType.Success);
                            }
                        }} /></div>
                    </div>
                </div>
                <div style={{
                    borderTop: '1px solid ' + Colors.BITFLEXBorder, textAlign: 'center',
                    paddingBottom: 10, paddingTop: 10, marginTop: 0,
                    background: 'rgba(67,60,60,.2)', marginLeft: -30,
                    marginRight: -20
                }}>
                    <span style={{ color: Colors.bitFlexGreenColor }}>
                        {paymentPageData?.transaction?.timeoutAt && <Countdown
                            daysInHours={true}
                            date={new Date(paymentPageData.transaction.timeoutAt).getTime()}
                            renderer={renderer}
                            onComplete={UpdateTransaction}
                        />}
                    </span> Time Remaining |  WebSocket: {wssConnected ? <span style={{ color: Colors.bitFlexGreenColor }}>Connected</span> : <>Connecting..</>}
                </div>
            </div>
        </>
    }

    const CashbackView = () => {
        if (!paymentPageData) return;
        return <>
            <div className="animated-border-box-glow"></div>
            <div className="animated-border-box" style={{ border: '1px dashed ' + Colors.bitFlexGoldenColor, borderRadius: 5, textAlign: 'center', padding: 10, paddingBottom: 10, paddingTop: 0, marginTop: 10, bottom: 30, left: 50, background: 'rgba(67,60,60,.2)', marginLeft: -35, marginRight: -35, marginBottom: -15 }}>
                <p style={{ fontSize: 17, fontWeight: 500 }}>Get 1% Cashback registering on BCFLEX</p>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '100%' }}>
                        <BFInput
                            onValidated={setisEmailValid}
                            type={BFInputType.Email}
                            placeholder={t('Email to receive cashback in USD')}
                            onValue={setemail}
                            isError={isFault}
                        />
                    </div>
                    <div style={{ marginLeft: 10 }}>
                        <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text="GET Cashback" isLoading={isCasbbackButtonLoading} onPress={() => {
                            setisCasbbackButtonLoading(true)
                            BitflexOpenApi.SignApi.apiSignCashbacksignupPost({
                                email: email,
                                merchantTransactionId: paymentPageData?.transaction?.id
                            }).finally(() => {
                                setisCasbbackButtonLoading(false)
                                setcashbackModalActive(false)
                                BFNotifictionRef.current?.Notify(t('Email sent'), t('Verification Email sent'), BFNotificationType.Success);
                            });
                        }}></BFGradientButton>
                    </div>
                </div>
                <div style={{ padding: 5, paddingTop: 10, color: Colors.Graytext, fontSize: 12 }}>What is cashback? When you buy something, you get a percentage of the amount it cost paid back to you.</div>
            </div>
        </>
    }

    const ViewManager = () => {
        // return WaitingForConfirmationsView();
        if (isWaitingForConfirmation) return WaitingForConfirmationsView();
        switch (result) {
            case TransactionState.Created: return PaymentView();
            case TransactionState.ProjectOkAwait: return OkAwaiting();
            case TransactionState.Timeout: return FaultView();
            case TransactionState.Payed: return SuccessView();
            case TransactionState.PendingConfirmations: return WaitingForConfirmationsView();
        }
        return Loading();
    }

    return (<>
        {/* <BFModalWindow title={'GET YOUR CASHBACK 💰💰💰'} isOpen={cashbackModalActive} onClose={() => {
            setcashbackModalActive(false)
        }}>
            <div style={{ position: 'relative', height: isMobile ? 185 : 173 }}>{CashbackView()}</div>
        </BFModalWindow> */}
        <div className="body-login login" id="maindiv">
            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                    {paymentPageData?.currency?.image && <img src={paymentPageData?.currency?.image} alt="" width={isMobile ? '30%' : 100} />}
                </Link>
            </div>
            <div className="content" style={{ position: 'relative' }}>
                <BFNotification ref={BFNotifictionRef} />
                <div style={{ borderBottom: '1px solid ' + Colors.BITFLEXBorder, textAlign: 'center', paddingBottom: 11, paddingTop: 25, marginTop: -20, background: 'rgba(67,60,60,.2)', marginLeft: -20, marginRight: -20 }}>
                    {<img src={FlexPayLogo_Color} alt="" width={160} />}
                </div>
                {ViewManager()}
            </div>
        </div>
        <div style={{ textAlign: 'center', verticalAlign: 'middle', marginTop: 0, paddingBottom: 5 }}>
            <p className="neon" >Flex Technologies Limited. 2021-{new Date().getFullYear()}</p>
        </div>
    </>
    );
}