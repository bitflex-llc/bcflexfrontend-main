/* eslint-disable jsx-a11y/alt-text */
import '../../../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../../html/BFNotification';
import { FaExclamationTriangle, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import Colors from '../../../../Colors';
import Cross from "../../../../images/cross.png"
import { DevicePermissionRequestType } from '../../../../api-wrapper';
import GoogleMapReact from 'google-map-react';
import HandSvg from "../../../../images/mobblock2.png"
import LoadingSvg from '../../../../images/loading.svg'
import OTPInput from '../../../html/BFOTPInput';
import { SetupCode } from '../../../../api-wrapper/api';
import get_app_qr from '../../../../images/qr-code.png'
import google_authenticatior_icon from '../../../../images/google-authenticator-2.svg'
import { isMobile } from 'react-device-detect';
import mobshield from "../../../../images/mobshield.png"
import mobunblock from "../../../../images/mobunblock.png"
import qrcodegauth from '../../../../images/qr-code-gauth.png'
import shield_png from '../../../../images/shield.png'
import { useSignalR } from '../../../../hooks/useSignalR';

import { QRCodeSVG } from 'qrcode.react';


const bip39 = require('bip39')

enum TfaStep {
    ChooseTwoFactorType,
    Initial,
    MobileDownload,
    BeforeWeStart,
    Confirmation,
    PengingDeviceConfirmation,
    Success_Activated,
    Device_Declined,

    InitialForGoogle,
    GoogleAuthenticatorDownload,
    GoogleAuthenticatorConfiguration,
    EnablingGoogleAuthenticator
}

export default function EnableTwoFactor({
    isDash,
    onClose,
    onTitleChange
}: {
    isDash?: boolean,
    onClose?,
    onTitleChange?
}) {

    let history = useNavigate();

    const { t } = useTranslation();

    // const mnemonic = bip39.generateMnemonic()
    // const entropy = bip39.mnemonicToEntropy(mnemonic);

    // console.log(mnemonic)
    // console.log(entropy)
    // console.log(bip39.entropyToMnemonic(entropy))

    // const[bitflexDeviceOd]

    const [OTP, setOTP] = useState("");

    const [setupCode, setsetupCode] = useState<SetupCode>();

    const [isLoading, setisLoading] = useState(true);


    const [currentStep, setcurrentStep] = useState<TfaStep>(TfaStep.ChooseTwoFactorType);
    const [mnemonic, setmnemonic] = useState();

    const [deviceName, setdeviceName] = useState();
    const [deviceId, setdeviceId] = useState<string>();
    const [ipAddress, setipAddress] = useState();

    const [lat, setlat] = useState<number>();
    const [lng, setlng] = useState<number>();

    const [tabIndex, settabIndex] = useState<number>();

    useEffect(() => {
        setmnemonic(bip39.generateMnemonic())

        setisLoading(true)

        BitflexOpenApi.UserApi.apiUserGenerateGoogleAuthenticatorSetupCodePost()
            .then(result => {
                if (result.data.manualEntryKey?.length === 26) {
                    setsetupCode(result.data);
                }
            })
            .finally(() => { setisLoading(false) })
            .catch(() => { alert(t('Error')) })

    }, []);

    const { Onweb_mobileactivate, Onweb_enabledtwofactor, Onweb_canceltwofactor, Onweb_mobileisonline_true } = useSignalR();

    const [title, setTitle] = useState<string>();
    let BFNotifictionRef = useRef<IBFNotification>(null);
    const [imageSrc, setimageSrc] = useState<string>();

    useEffect(() => {
        if (onTitleChange)
            onTitleChange(title)
    }, [onTitleChange, title]);

    useEffect(() => {
        currentStep === TfaStep.MobileDownload && BitflexOpenApi.SignApi.apiVversionSignIsAnyDeviceOnlinePost("1.0",);
    }, [currentStep])

    useEffect(() => {
        // if (!Onweb_mobileactivate) return;
        // if (currentStep !== TfaStep.MobileDownload) return;

        Onweb_mobileactivate((isActivated, deviceName, ip, lat, lng, deviceIdr) => {
            console.log("Onweb_mobileactivate", isActivated, deviceName, ip, lat, lng, deviceIdr)
            setdeviceName(deviceName);
            setipAddress(ip);
            setlat(parseFloat(lat))
            setdeviceId(deviceIdr)
            setlng(parseFloat(lng))

            if (isActivated)
                setcurrentStep(TfaStep.BeforeWeStart);
        });
    }, [Onweb_mobileactivate]);

    useEffect(() => {
        Onweb_enabledtwofactor(() => setcurrentStep(TfaStep.Success_Activated))
        Onweb_canceltwofactor(() => setcurrentStep(TfaStep.Device_Declined))
        Onweb_mobileisonline_true(() => setcurrentStep(TfaStep.BeforeWeStart))

    }, [Onweb_canceltwofactor, Onweb_enabledtwofactor, Onweb_mobileisonline_true, currentStep]);

    function RenderSwitch(param: TfaStep) {
        switch (param) {
            case TfaStep.ChooseTwoFactorType: return ConfigureGoogleAuthenticator()
            case TfaStep.Initial: return ConfigureGoogleAuthenticator();
            case TfaStep.MobileDownload: return DownloadApplicationAndWaitingForActivation();
            case TfaStep.BeforeWeStart: return BeforeWeStartView();
            case TfaStep.Confirmation: return ConfirmationView();
            case TfaStep.PengingDeviceConfirmation: return PengingDeviceConfirmationView();
            case TfaStep.Success_Activated: return SuccessActivatedView();
            case TfaStep.Device_Declined: return DeviceDeclinedView();
            case TfaStep.InitialForGoogle: return InitialForGoogleView();
            case TfaStep.GoogleAuthenticatorDownload: return DownloadGoogleAuthenticator();
            case TfaStep.GoogleAuthenticatorConfiguration: return ConfigureGoogleAuthenticator();
            case TfaStep.EnablingGoogleAuthenticator: return EnablingGoogleAuthenticator();
        }
    }


    function DownloadGoogleAuthenticator() {

        setTitle('Get Google Authenticator')
        setimageSrc(undefined)
        return <div style={{ padding: 10, paddingTop: 5 }}>

            <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 0, borderRadius: 4, marginTop: 0, paddingBottom: 0, marginBottom: 10 }}>

                <div style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>Scan code below with your mobile device to get Google Authenticator</div>
                    <img src={qrcodegauth} width={'60%'} />
                </div>
            </div>

            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => setcurrentStep(TfaStep.GoogleAuthenticatorConfiguration)} text={"Got it. Continue"} width={'100%'} />
            </div>
        </div>
    }

    function ConfigureGoogleAuthenticator() {
        setTitle('Configure Google Authenticator')
        setimageSrc(undefined)
        return <div style={{ padding: 10, paddingTop: 0 }}>
            <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 0, borderRadius: 4, marginTop: 10, paddingBottom: 0 }}>
                <div style={{ padding: 12 }}>
                    <div>1. Save Your Backup Code</div>
                    <div style={{ borderRadius: 4, borderColor: Colors.bitFlexGoldenColor, borderStyle: 'dashed', borderWidth: 1, padding: 10, margin: 10, marginLeft: 0, marginRight: 0 }}>
                        <div>{setupCode?.accountSecretKey}</div>
                    </div>
                    <div>
                        <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} onPress={() => {
                            navigator.clipboard.writeText(setupCode?.accountSecretKey!)
                            BFNotifictionRef.current?.Notify(t('Success'), t('Copied'), BFNotificationType.Success);
                        }} text={t("Copy")} width={'100%'} />
                    </div>
                </div>
            </div>
            <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, marginTop: 10, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ marginBottom: 22 }}>2. Configure Google Authenticator</div>
                {setupCode?.otpCleanUrl && <BFGradientButton buttonType={BFGradientButtonType.GreenBorder} text={'Add to OTP Application'} width={'100%'} onPress={() => {
                    if (setupCode?.otpCleanUrl)
                        window.location.href = decodeURIComponent(setupCode.otpCleanUrl);
                }} />}
            </div>
            <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, marginTop: 10, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ marginBottom: 22 }}>2. Manual Configuration</div>

                <Tabs
                    className='tabbable-custom'
                    style={{ margin: -12 }}
                    selectedIndex={tabIndex}
                    onSelect={settabIndex}>
                    <TabList>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' selected style={{ width: '50%' }}><Trans>By QR-Code</Trans></Tab>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '50%' }}><Trans>Manual Input</Trans></Tab>
                    </TabList>
                    <TabPanel>
                        <div style={{ padding: 12, textAlign: 'center', fontSize: 16, justifyContent: 'space-between' }}>
                            <div style={{ marginBottom: 10 }}>Scan this QR for automatic configuration</div>
                            <QRCodeSVG value={decodeURIComponent(decodeURIComponent(setupCode?.otpCleanUrl!))} bgColor={'transparent'} size={256} fgColor={'rgba(255,255,255,0.8)'} />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ display: 'flex', flexDirection: 'row', fontSize: 14, padding: 10 }}>
                            <div style={{ marginRight: 6 }}>Account: </div>
                            <div style={{ color: Colors.bitFlexGoldenColor }}>Your Email</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', fontSize: 13, padding: 10 }}>
                            <div style={{ marginRight: 6 }}>Key:</div>
                            <div style={{ color: Colors.bitFlexGoldenColor }}>{setupCode?.manualEntryKey}</div>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => setcurrentStep(TfaStep.EnablingGoogleAuthenticator)} text={"Configured. Continue"} width={'100%'} />
            </div>
        </div>
    }



    const EnablingGoogleAuthenticator = () => {

        const [otpCode, setotpCode] = useState<string>();

        setTitle('Enabling Google Authenticator')
        setimageSrc(undefined)
        return <div style={{ padding: 10, paddingTop: 5 }}>
            <div style={{ padding: 0, marginBottom: 10 }}>
                <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, marginTop: 0, paddingBottom: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 15, marginTop: 15 }}>
                        <div>
                            <img src={google_authenticatior_icon} className="widget-thumb-icon" style={{ height: 50, marginRight: 10 }} alt={'two step icon'} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 22, color: Colors.Graytext }}>Input Code from</div>
                            <div style={{ fontSize: 22, color: 'white' }}>Google Authenticator</div>
                        </div>
                    </div>

                    <OTPInput
                        autoFocus
                        isNumberInput
                        length={6}
                        className="otpContainer"
                        inputClassName="otpInput"
                        onChangeOTP={(otp) => {
                            if (otp.length === 6)
                                setotpCode(otp)
                        }}
                    />

                </div>
            </div>

            <div className={'content2faFooter'} style={{ textAlign: 'center' }}>
                <BFGradientButton buttonType={BFGradientButtonType.Green} isLoading={isLoading} isDisabled={!otpCode} onPress={() => {
                    setisLoading(true)
                    BitflexOpenApi.UserApi.apiUserVerifyGoogleAuthenticatorSetupCodePost(otpCode).then(response => {
                        if (!response.data.success) {
                            BFNotifictionRef.current?.Notify("Failed to enable Authenticator", "Wrong Code or other error", BFNotificationType.Error)

                        } else {
                            BFNotifictionRef.current?.Notify("Success", "Authenticator Enabled!", BFNotificationType.Success)
                            setTimeout(() => window.location.reload(), 500)
                        }
                    })
                }} text={"Activate Google Authenticator"} width={'100%'} />

                <button onClick={() => setcurrentStep(TfaStep.GoogleAuthenticatorConfiguration)} style={{ background: 'transparent', border: 0, color: Colors.bitFlexGoldenColor, paddingTop: 10, opacity: 0.6 }}>Take me back</button>
            </div>


        </div>
    }

    function DeviceDeclinedView() {
        setTitle(t("BCFLEX Guard Enable Cancel"))
        setimageSrc(Cross)

        return <div style={{ padding: 20 }}>
            <div style={{ alignContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: 25 }}>
                <div className={'info-well'} style={{ margin: 0, marginTop: 15, marginLeft: 30, marginRight: 30, fontSize: 17 }}>
                    <p style={{ fontWeight: 500, margin: 0 }}>2-Step Verification System was <span style={{ color: 'red' }}>not Enabled</span></p>
                </div>
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => {
                    history('/terminal')
                }} text={t("Continue to Terminal")} width={'100%'} />
            </div>
        </div>
    }

    function SuccessActivatedView() {
        setTitle(t("BCFLEX Guard Enabled"))
        setimageSrc(HandSvg)

        return <div style={{ padding: 20 }}>

            <div style={{ alignContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: 10 }}>
                <div className={'info-well success-well'} style={{ margin: 0, fontSize: 17, marginBottom: 20 }}>
                    <p style={{ fontWeight: 500, margin: 0 }}>Your log on, withdrawal, and changing of sensitive data requests are protected now with 2-Step Verification with BCFLEX Guard 🔐</p>
                </div>
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Green} onPress={() => {
                    history('/terminal')
                }} text={t("Continue to Terminal")} width={'100%'} />
            </div>
        </div>
    }

    function ConfirmationView() {
        setTitle("Device Confirmation")
        setimageSrc(undefined)

        const parameters = {
            center: {
                lat: lat,
                lng: lng
            },
            zoom: 12
        };

        return <div style={{ padding: 20 }}>
            <div style={{ height: 150, backgroundColor: '#433C3C33', textAlign: 'center', margin: -25, display: 'flex', marginBottom: 10, justifyContent: 'center', alignContent: 'center', flexDirection: 'column' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyDXtRorcZl83yurLV6y2LPWd5WqN8RHBQ4" }}
                    defaultCenter={parameters.center}
                    defaultZoom={parameters.zoom} />
            </div>
            <p className={'enableTfaTitle'}>Authorize this device?</p>
            <table>
                <tr>
                    <td className={'enableTfaTextRow'}>Device Information: </td>
                    <td className={'enableTfaTextRowValue'}>{deviceName}</td>
                </tr>
                <tr>
                    <td className={'enableTfaTextRow'} style={{ paddingTop: 8 }}>Current IP: </td>
                    <td className={'enableTfaTextRowValue'} style={{ paddingTop: 8 }}>{ipAddress}</td>
                </tr>
            </table>
            <div className={'info-well warning-well'} style={{ margin: 0, marginBottom: 15, marginTop: 15 }}>
                <p style={{ fontWeight: 500, margin: 0 }}>This device will be allowed to confirm authentication requests from other devices and sign withdrawals</p>
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Green} onPress={() => {
                    BitflexOpenApi.SignApi.apiVversionSignAskForPermissionPost("1.0", { bitflexDeviceId: deviceId, type: DevicePermissionRequestType.EnableTwoFactor }).then(result => {
                        console.log(result.data)
                    })
                    setcurrentStep(TfaStep.PengingDeviceConfirmation)
                }} text={t("CONFIRM THIS DEVICE")} width={'100%'} />
            </div>
        </div>
    }

    function BeforeWeStartView() {
        setTitle(deviceName)
        setimageSrc(undefined)
        return <div style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ height: 150, marginTop: -25, marginLeft: -20, marginRight: -20, backgroundColor: '#433C3C33', textAlign: 'center', display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center' }}>
                    <FaExclamationTriangle size={54} style={{ color: '#cf8900', marginBottom: 10 }} />
                    <p style={{ margin: 0, fontSize: 22, color: 'white' }}>BACKUP PHRASE</p>
                </div>
            </div>
            <p style={{ fontWeight: 400, fontSize: 16, color: Colors.bitFlexGoldenColor }}>
                Save or right down your backup mnemonic phrase
            </p>
            <div className={'info-well warning-well'} style={{ padding: 15, margin: 0, marginBottom: 10, marginTop: 10 }}>
                <p style={{ fontWeight: 400, margin: 0, fontSize: 17 }}>If you lose your phone or otherwise can't authenticate you can use backup phrase to turn off 2FA</p>
            </div>
            <div style={{ marginBottom: 10 }}>
                <textarea rows={4} value={mnemonic} className={'backupTextArea'} />
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Destructive} onPress={() => setcurrentStep(TfaStep.Confirmation)} text={t("I'VE STORED PHRASE. CONTINUE")} width={'100%'} />
            </div>
        </div>
    }

    function DownloadApplicationAndWaitingForActivation(): JSX.Element {
        setTitle(t("Install BCFLEX Application"))
        setimageSrc(get_app_qr)
        return <div style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'white', fontWeight: 400, fontSize: 16 }}>
                Scan the QR code above to get the iOS or Android BCFLEX Application. Authorize with your credentials, using your email and password and follow instructions. This page will automatically reload.
            </p>
            <div style={{ textAlign: "center" }}>
                <img
                    className="widget-thumb-icon"
                    src={LoadingSvg}
                    alt="Loading"
                    style={{ height: 190 }}
                />
                <div style={{ margin: 25 }}>
                    <p style={{ color: Colors.bitFlexGoldenColor }}>Waiting for application to come online...</p>
                </div>
            </div>
        </div>
    }

    function PengingDeviceConfirmationView() {
        setTitle(t("Waiting for action on ") + deviceName)
        setimageSrc(mobshield)
        return <div style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'white', fontWeight: 400, fontSize: 16, lineHeight: 1.4 }}>
                Waiting for enabling of <span style={{ fontWeight: 500, color: '#cf8900' }}> BCFLEX Guard</span> on your <b style={{ color: 'white' }}>{deviceName}</b>. Press "Enable" at your mobile phone to enable and "Decline" to cancel this process.
            </p>
            <div style={{ textAlign: "center" }}>
                <img
                    className="widget-thumb-icon"
                    src={LoadingSvg}
                    alt="Loading"
                    style={{ height: 200, marginTop: -30, marginBottom: -30 }}
                />
            </div>
        </div>
    }

    const EnableTwoFactorView = () => {
        setTitle(t("BCFLEX Guard Setup"))
        setimageSrc(shield_png)

        return <div style={{ padding: 20 }}>
            <table style={{ marginTop: 20 }}>
                <tr>
                    <td className={'enableTfaTextRow'}>Verification By: </td>
                    <td className={'enableTfaTextRowValue'}> BCFLEX In-App Guard (iOS & Android)</td>
                </tr>
                <tr>
                    <td className={'enableTfaTextRow'} style={{ paddingTop: 8 }}>Backup option: </td>
                    <td className={'enableTfaTextRowValue'} style={{ paddingTop: 8 }}>Mnemonic Phrase</td>
                </tr>
            </table>
            <div style={{ textAlign: 'center' }}>
                <div
                    style={{ padding: 0, borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: 'white', marginBottom: 25, marginTop: 10, display: 'inline-flex', cursor: 'pointer' }}
                    onClick={() => window?.open("https://youtube.com", '_blank')?.focus()}
                >
                    <p style={{ color: 'white', fontSize: 17, marginBottom: 3 }}>How does BCFLEX Guard work? Watch on YouTube </p>
                    &nbsp;&nbsp;
                    <div style={{ marginTop: 18 }}><FaYoutube size={24} /></div>

                </div>
            </div>
            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => setcurrentStep(TfaStep.MobileDownload)} text={'CONTINUE'} width={'100%'} />
            </div>
        </div>
    };

    function InitialForGoogleView() {
        setTitle(t("Google Authenticator Setup"))
        setimageSrc(google_authenticatior_icon)

        return <div style={{ padding: 20 }}>
            <table style={{ marginTop: 0, marginBottom: 25, }}>
                <tr>
                    <td className={'enableTfaTextRow'}>Verification By: </td>
                    <td className={'enableTfaTextRowValue'}>Google Authenticator</td>
                </tr>
                <tr>
                    <td className={'enableTfaTextRow'} style={{ paddingTop: 8 }}>Backup option: </td>
                    <td className={'enableTfaTextRowValue'} style={{ paddingTop: 8 }}>Backup Code</td>
                </tr>
            </table>

            <div className={'content2faFooter'}>
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => setcurrentStep(TfaStep.GoogleAuthenticatorDownload)} text={'CONTINUE'} width={'100%'} />
            </div>
        </div>
    }

    const ChooseTwoFactorType = () => {
        setTitle(t("Choose Two Step Verification System"))
        setimageSrc(mobunblock)
        return <> <div style={{ display: 'flex', marginTop: 0, flexWrap: isMobile ? 'wrap' : 'unset' }}>
            <div style={{
                width: isMobile ? '100%' : '50%', padding: 25,
                textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', margin: 7,
                borderRadius: '4px !important', position: 'relative', cursor: 'pointer'
            }} className={'border-radius-5-important'} onClick={() => setcurrentStep(TfaStep.Initial)}>
                <div className="ribbon ribbon-top-left"><span>PREFERRED</span></div>
                <img src={shield_png} style={{ width: '60%', marginBottom: 15 }} />
                <BFGradientButton buttonType={BFGradientButtonType.Action} onPress={() => setcurrentStep(TfaStep.Initial)} text={' BCFLEX GUARD'} width={'100%'} />
            </div>
            <br />
            <div style={{
                width: isMobile ? '100%' : '50%', padding: 25,
                textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)', margin: 7,
                borderRadius: '4px !important', cursor: 'pointer'
            }} className={'border-radius-5-important'} onClick={() => setcurrentStep(TfaStep.InitialForGoogle)}>
                <img src={google_authenticatior_icon} style={{ width: '60%', marginBottom: 15 }} />
                <BFGradientButton buttonType={BFGradientButtonType.Shadow} onPress={() => setcurrentStep(TfaStep.InitialForGoogle)} text={'Authenticator'} width={'100%'} />
            </div>
        </div>
        </>
    };

    const RenderModal = () => {
        return <div>
            <div style={{ position: 'relative' }}>
                <BFNotification ref={BFNotifictionRef} />
            </div>

            {/* <div className={'bf-dash-header'} style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 15,
                fontSize: 19,
                color: 'white',
                borderBottomWidth: 1,
                borderBottomColor: Colors.BITFLEXBorderTerminal,
                borderBottomStyle: 'solid',
                alignContent: 'center',
                alignItems: 'center',
            }}>

                {/* <div style={{ display: 'flex' }}>
                    <div style={{ marginTop: 1 }}>{currentStep === TfaStep.BeforeWeStart && <FaCircle style={{ color: Colors.bitFlexGreenColor, marginRight: 5, }} />}</div>&nbsp;
                    {title}
                </div> 
                {currentStep === TfaStep.MobileDownload &&
                    <div style={{ marginTop: 3, display: 'flex', float: 'left', flexDirection: 'row', justifyContent: 'space-around', marginRight: '30%' }}>
                        <FaAppStore />
                        &nbsp;&nbsp;
                        <FaGooglePlay />
                    </div>
                }

            </div> */}
            {(imageSrc && !isMobile) &&
                <div style={{ height: 170, backgroundColor: '#242522', textAlign: 'center' }}>
                    <img src={imageSrc} style={{ height: 170, marginTop: 0 }} />
                </div>
            }
            <div style={{ marginTop: 5 }}>{RenderSwitch(currentStep)}</div>
        </div>
    };

    return <RenderModal />
}