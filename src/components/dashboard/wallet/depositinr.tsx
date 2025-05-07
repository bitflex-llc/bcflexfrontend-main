import 'moment-timezone';

import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../html/BFNotification';
import { GetAddressResponse, INRBanks } from '../../../api-wrapper';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { FaDotCircle, FaWallet } from 'react-icons/fa';
import { ICurrency } from '../../../store/types';
import { Store } from '../../../store';
import loading_png from '../../../images/loading.svg';

import { QRCodeSVG } from 'qrcode.react';
import Colors from '../../../Colors';

import HDFC from '../../../images/HDFC-Bank-Limited-Symbol.png'
import UPI_QR from '../../../images/qr-code_upi2.png'
import UPI from '../../../images/upi_logo_icon_169316.webp'
import { BFInput, BFInputType } from '../../html/BFInput';
import { StylesDictionary } from '../affiliate/Manage';
import imageCompression from 'browser-image-compression';

async function compress(elementUploader): Promise<File> {
    return await imageCompression(elementUploader.target.files[0], {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    });
}

export function DepositINRModal({
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

    const [documents, setdocuments] = useState<File>();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const [isLoading, setisLoading] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const [currencyNetworkId, setCurrencyNetworkId] = useState(0);

    const [nextButtonClicked, setnextButtonClicked] = useState(false)

    const [bankName, setBankName] = useState<INRBanks>();
    const [trsnactionId, setTransactionid] = useState<string>();

    const handleFocus = (event: { target: { select: () => any; }; }) => event.target.select();

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

    function handleEvent() {
        setisLoading(true)
    };

    const [amount, setAmount] = useState(0);


    if (nextButtonClicked) return <>
        <div className="row bf-row" ref={divRef}>
            <h4 style={{ marginTop: -15 }}>After Transaction Form:</h4>

            <div className="col-lg-9" style={{ padding: 0 }}>

                <h5 style={{ marginBottom: 5 }}>Enter Amount:</h5>
                <div className="form-group">
                    <BFInput
                        type={BFInputType.Decimal}
                        onValue={setAmount}
                        setValue={amount}

                    />
                </div>

                <h5 style={{ marginBottom: 5 }}>Transaction ID:</h5>
                <div className="form-group">
                    <BFInput
                        type={BFInputType.Text}
                        onValue={setTransactionid}
                        setValue={trsnactionId}

                    />
                </div>

                <div style={styles.idanddriving}>

                    <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                        <Trans><h4>Upload transaction Reciept/Slip</h4></Trans>
                        <div style={{ width: '100%' }}>
                            <BFGradientButton buttonType={BFGradientButtonType.Shadow} width={'80%'} text='Select File.. (image, pdf)' onPress={() =>
                                document?.getElementById("selectFrontImage")?.click()
                            }></BFGradientButton>
                            <input
                                type="file"
                                id='selectFrontImage'
                                accept="image/*,application/pdf"
                                name='front'
                                onChange={passportElement => {
                                    compress(passportElement)
                                        .then((compressedFile: File) => setdocuments(compressedFile));
                                }}
                                hidden={true}
                            />
                        </div>

                    </div>
                </div>

                <div style={{ marginBottom: 10, marginTop: 10 }}>
                    <BFGradientButton
                        buttonType={BFGradientButtonType.GoldenBorder}
                        text={t("Submit Transaction")}
                        width={"100%"}
                        onPress={() => {
                            BitflexOpenApi.Init();
                            BitflexOpenApi.BalanceApi.apiBalanceManualDepositPost(amount, trsnactionId, 11, documents)
                                .then(response => {
                                    console.log(response.data)
                                    onClose();

                                })
                        }}
                    />
                </div>
            </div>
        </div>
    </>

    return (
        <div className="row bf-row" ref={divRef}>
            <h3 style={{ marginTop: -15 }}>Select Bank:</h3>
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


            {bankName ==  INRBanks.Hdfc &&
                <>
                    <div className="col-lg-9" style={{ padding: 0 }}>
                        <h4>Selected Bank Details:</h4>

                        <h5 style={{ marginBottom: 2 }}>Bank Name</h5>
                        <div className="form-group">
                            <input type="text" className="input-inline-form maxwidth height45" value={"HDFC Bank"} readOnly />
                        </div>

                        <h5 style={{ marginBottom: 2 }}>Account Number</h5>
                        <div className="form-group">
                            <input type="text" className="input-inline-form maxwidth height45" value={"50200107905856"} readOnly />
                        </div>

                        <h5 style={{ marginBottom: 2 }}>IFSC Code</h5>
                        <div className="form-group">
                            <input type="text" className="input-inline-form maxwidth height45" value={"HDFC0000981"} readOnly />
                        </div>

                        <h5 style={{ marginBottom: 2 }}>Company Name</h5>
                        <div className="form-group">
                            <input type="text" className="input-inline-form maxwidth height45" value={"Star Agro"} readOnly />
                        </div>
                        <h5 style={{ color: 'whitesmoke', padding: 1 }}>1. DO NOT mention any crypto releated notes in Narration / Remarks</h5>
                        <h5 style={{ color: 'whitesmoke', padding: 1 }}>2. Deposit Bank Details may change on every request</h5>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <BFGradientButton
                            buttonType={BFGradientButtonType.GoldenBorder}
                            text={t("Transaction was made. Next.")}
                            width={"100%"}
                            onPress={() => setnextButtonClicked(true)}

                        />
                    </div>

                </>
            }


            {bankName == INRBanks.Upi &&
                <>
                    <div className="col-lg-9" style={{ padding: 0 }}>
                        <h4>UPI Transaction Details:</h4>

                        <h5 style={{ marginBottom: 2 }}>UPI ID</h5>
                        <div className="form-group">
                            <input type="text" className="input-inline-form maxwidth height45" value={"staragro2709@okicici"} readOnly />
                        </div>

                        <BFGradientButton
                            buttonType={BFGradientButtonType.Action}
                            text={t("Pay in UPI App")}
                            width={"100%"}
                            to='upi://pay?pa=staragro2709@okicici&pn=Anil%20kumar%20Das&aid=uGICAgKDQ55G9Yg'

                        />


                        <img alt="UPI QR" style={{ width: '100%', marginTop: 0, marginRight: 0 }} src={UPI_QR} />

 

                        <h5 style={{ color: 'whitesmoke', padding: 1 }}>1. DO NOT mention any crypto releated notes in Narration / Remarks</h5>
                        <h5 style={{ color: 'whitesmoke', padding: 1 }}>2. Deposit Bank Details may change on every request</h5>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <BFGradientButton
                            buttonType={BFGradientButtonType.GoldenBorder}
                            text={t("Transaction was made. Next.")}
                            width={"100%"}
                            onPress={() => setnextButtonClicked(true)}

                        />
                    </div>

                </>
            }
        </div>
    );
}

const styles: StylesDictionary = {
    passport: {
        padding: 15,
        backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto',
        textAlign: 'center', height: 320, position: 'relative'
    },
    idanddriving: {
        padding: 15,
        backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto',
        textAlign: 'center', height: 139
    }
}
