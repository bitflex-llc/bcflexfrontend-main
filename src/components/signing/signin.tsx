/* eslint-disable jsx-a11y/alt-text */
import '../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { DevicePermissionRequestType, SignInResponseResult } from '../../api-wrapper';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BitflexLogo from '../../images/bitflex-logo.svg';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from '../../Colors';
import { FaCheck, FaLock } from 'react-icons/fa';
import OTPInput from '../html/BFOTPInput';
import { TwoStepVerificationTypes } from '../../api-wrapper/api';
import google_auth from '../../images/google-authenticator-2.svg'
import bf_shield from '../../images/shield.svg'
import { isMobile } from 'react-device-detect';

import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import { useCallback } from 'react';
import { useCryptoKeys } from '../../hooks/useCryptoKeys';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';

export default function Signin() {

    const { setSignIn } = useUserState();

    const history = useNavigate();
    const [isFault, setIsFault] = React.useState(false);
    const [requireTfa, setrequireTfa] = React.useState(false);
    const [twoStepVerificationType, settwoStepVerificationType] = useState<TwoStepVerificationTypes>();

    const [recaptchaToken, setrecaptchaToken] = useState('');
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { t } = useTranslation();
    const { GetTerminalConnectionId, Onweb_2step_confirmed } = useSignalR();
    const [isLoading, setisLoading] = useState(false);
    const { LoadKeys } = useCryptoKeys();

    const [email, setemail] = useState<string>();
    const [password, setpassword] = useState<string>();
    const [isEmailValid, setisEmailValid] = useState(false);
    const [isPassportValid, setisPassportValid] = useState(false);

    const [OTP, setOTP] = useState("");

    const [rememberDevice, setrememberDevice] = useState(false);

    useEffect(() => {
        BitflexOpenApi.SignApi.apiVversionSignSigninGet("1.0",).then(console.log)
    }, [])

    useEffect(() => {
        LoadKeys();
        Onweb_2step_confirmed((jwtToken, expiryTimestamp, obfuscatedEmail) => {
            console.log(jwtToken, expiryTimestamp, obfuscatedEmail)
            localStorage.setItem("obfuscatedEmail", obfuscatedEmail)
            BitflexOpenApi.Init(jwtToken);
            setSignIn(jwtToken, expiryTimestamp)
            history('/wallet/assets');
        })

    }, [LoadKeys, Onweb_2step_confirmed, history, setSignIn]);

    useEffect(() => {
        if (executeRecaptcha)
            executeRecaptcha("login_page").then(token => {
                setrecaptchaToken(token)
            })
    }, [executeRecaptcha]);

    const { bitflexDeviceId } = useBitflexDeviceId();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const onSubmit = useCallback(() => {
        var recaptchaCurrent = recaptchaToken;
        if (executeRecaptcha)
            executeRecaptcha("login_page").then(token => {
                setrecaptchaToken(token)
            })

        if (!email || !password) {
            BFNotifictionRef.current?.Notify(t('Error'), t('Fill in all fields'), BFNotificationType.Error);
            return;
        }

        setisLoading(true)
        BitflexOpenApi.SignApi.apiVversionSignSigninPost("1.0", {
            email: email,
            password: password,
            reCaptchav3Token: recaptchaCurrent,
            bitflexDeviceId: bitflexDeviceId,
            rememberedDeviceToken: localStorage.getItem("rememberDeviceId")
        })
            .then(result => {
                console.log("apiVversionSignSigninPost", result.data);
                switch (result.data.result) {

                    case SignInResponseResult.ReCaptchav3Failed:
                        window.location.reload();
                        break;
                    case SignInResponseResult.Success:
                        if (result.data.authToken) {

                            BitflexOpenApi.Init(result.data.authToken);

                            if (result.data.email)
                                localStorage.setItem("obfuscatedEmail", result.data.email)

                            setSignIn(result.data.authToken, result.data.expiryTimestamp)

                            history('/wallet/assets', {
                                state: { requireSetPush: true }
                            });
                        } else {
                            BFNotifictionRef.current?.Notify(t('Error'), t('Error on server side. Try again later'), BFNotificationType.Error);
                        }

                        break;
                    case SignInResponseResult.WrongCredentials:
                    case SignInResponseResult.WrongPassword:
                        BFNotifictionRef.current?.Notify(t('Error'), t('Invalid email and/or password'), BFNotificationType.Error);
                        setIsFault(true)
                        break;

                    case SignInResponseResult.EmailNotConfirmed:
                        BFNotifictionRef.current?.Notify(t('Error'), t('Email not confirmed'), BFNotificationType.Error)
                        break;

                    case SignInResponseResult.RequireTwoFactor:
                        setrequireTfa(true);
                        settwoStepVerificationType(result.data.twoFactorType)

                        // if (result.data.twoFactorType === TwoStepVerificationTypes.Bitflex)
                        //     BitflexOpenApi.SignApi.apiVversionSignAskPermissionSignInPost("1.0", {
                        //         type: DevicePermissionRequestType.ConfirmLogin,
                        //         bitflexDeviceId: bitflexDeviceId,
                        //         userId: result.data.userId,
                        //         terminalSignalRConnectionId: GetTerminalConnectionId()
                        //     }).then(payload => {
                        //         console.log(payload)
                        //     }).catch(error => console.warn('SignIn ->  BitflexOpenApi.SignApi.apiVversionSignAskForPermissionPost -> ', error))

                        break;
                    case SignInResponseResult.BitflexDeviceIdIsNotPresent:

                        BFNotifictionRef.current?.Notify(t('Error'), t(' BCFLEX device generation Error, try to clear cache'), BFNotificationType.Error)
                        break;
                }
            })
            .finally(() => setisLoading(false))
            .catch((e) => BFNotifictionRef.current?.Notify(t('Error'), t('Account is locked or unrecognized error appear. Contact support Telegram: @bitflex_exchange'), BFNotificationType.Error))

    }, [GetTerminalConnectionId, bitflexDeviceId, email, executeRecaptcha, history, password, recaptchaToken, setSignIn, t]);

    useEffect(() => {
        const listener = event => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                onSubmit();
            }
        };
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [email, onSubmit, password]);

    const RememberDeviceRow = useCallback(({ isChecked, setChecked, text }): JSX.Element => {
        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => setChecked(!isChecked)}>
            <div style={{
                margin: 4, background: isChecked ? Colors.bitFlexGreenColor : 'transparent', borderRadius: 5,
                padding: 2, paddingLeft: 20, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGreenColor : '#433C3C',
                marginBottom: 14
            }}>
                <div>
                    <div style={{ fontSize: 14, color: 'rbga(255,255,255,0.8)' }}>{text}</div>
                </div>
                <div>
                    <FaCheck style={{ fontSize: 20, color: 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                </div>
            </div>
        </div>
    }, []);

    return (
        <div className="body-login login" id="maindiv" style={{ alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                    <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                </Link>
            </div>
            <div className="content">
                <BFNotification ref={BFNotifictionRef} />
                <div className='box-login'>
                    <div id="stay-in-place" style={{ position: 'relative' }}>
                        <h3 className="form-title"><Trans>Sign In</Trans></h3>
                        <div className=''>
                            <div>
                                <p style={{ textAlign: 'center', paddingTop: 0, color: 'rgba(255,255,255,0.8)' }}>Ensure that you are visiting bcflex.com</p>
                                <div style={{
                                    borderWidth: 1, borderStyle: 'solid', borderColor: Colors.Graytext,
                                    borderRadius: 30, padding: 7, margin: 3, marginLeft: '22%', marginRight: '22%', textAlign: 'center',
                                    display: 'flex', flexDirection: 'row', justifyContent: 'center'
                                }}>
                                    <div style={{ lineHeight: '18px' }}><FaLock color={Colors.bitFlexGreenColor} size={13} /></div>
                                    &nbsp;&nbsp;
                                    <div style={{ lineHeight: '17px' }}><span style={{ color: Colors.bitFlexGreenColor }}>https://</span>bcflex.com</div>
                                </div>
                            </div>
                            <div>
                                <label><Trans>Email</Trans></label>
                                <BFInput
                                    onValidated={setisEmailValid}
                                    type={BFInputType.Email}
                                    placeholder={t('Email used at registration')}
                                    onValue={setemail}
                                    isError={isFault}
                                />
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <label className="control-label"><Trans>Password</Trans></label>
                                <BFInput
                                    onValidated={setisPassportValid}
                                    type={BFInputType.Password}
                                    placeholder={t('Password')}
                                    onValue={setpassword}
                                    isError={isFault}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginLeft: 2, marginRight: 3 }}>
                                <BFGradientButton isDisabled={!isEmailValid || !isPassportValid} isLoading={isLoading} buttonType={BFGradientButtonType.Action} text={t('Submit')} onPress={onSubmit} />
                                <div><Link to="/signing/restore" className='dot'>Forgot Password?</Link></div>
                            </div>
                            <div className="create-acc">
                                <p>
                                    <Link to="/signup">Don't Have an Account? <span style={{ color: '#cf8900' }}>Sign up</span></Link>
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', opacity: 0.15 }}>This site is protected by reCAPTCHA and the Google
                            <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
                            <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
                        </div>
                    </div>

                    <div className={!requireTfa ? 'app-hover-disabled' : 'app-hover-disabled app-hover-active'} style={{ textAlign: 'center' }}>
                        {/* {twoStepVerificationType === TwoStepVerificationTypes.Bitflex && <>
                            <h3 className="form-title">Verify Your Identity <FaLock style={{ color: '#cf8900' }} /></h3>
                            <p>This account is protected with BCFLEX Guard</p>
                            <img
                                className="widget-thumb-icon"
                                src={loading_png}
                                alt="Loading"
                                style={{ width: 160 }}
                            />
                            <div className="info-well warning-well">
                                <h4 style={{ color: '#FFF', lineHeight: '22px' }}>Waiting for BCFLEX Application to complete challenge</h4>
                            </div>
                        </>
                        } */}

                        {twoStepVerificationType === TwoStepVerificationTypes.Google && <>
                            <h3 className="form-title">Account Secured</h3>
                            <p>Enter one-time-password from Authenticator App</p>
                            <img src={bf_shield} width={'25%'} />
                            <div style={{ marginTop: 10, marginBottom: 5 }}>
                                <OTPInput
                                    autoFocus
                                    isNumberInput
                                    length={6}
                                    className="otpContainer"
                                    inputClassName="otpInput"
                                    onChangeOTP={(otp) => {
                                        if (otp.length === 6)
                                            setOTP(otp)
                                    }}
                                />
                            </div>
                            <RememberDeviceRow isChecked={rememberDevice} setChecked={setrememberDevice} text={t('Remember this device?')} />
                            <BFGradientButton buttonType={BFGradientButtonType.Action} width={'98%'} text={t('Confirm')} onPress={() => {
                                var recaptchaCurrent = recaptchaToken;
                                if (executeRecaptcha)
                                    executeRecaptcha("login_page").then(token => {
                                        setrecaptchaToken(token)
                                    })

                                if (!email || !password || !OTP) {
                                    BFNotifictionRef.current?.Notify(t('Error'), t('Fill in all fields'), BFNotificationType.Error);
                                    return;
                                }

                                BitflexOpenApi.SignApi.apiVversionSignSigninPost("1.0", {
                                    email: email,
                                    password: password,
                                    reCaptchav3Token: recaptchaCurrent,
                                    bitflexDeviceId: bitflexDeviceId,
                                    googleTfaCode: OTP,
                                    rememberDevice: rememberDevice
                                }).then(result => {
                                    switch (result.data.result) {
                                        case SignInResponseResult.GoogleTfaWrong:
                                            BFNotifictionRef.current?.Notify(t('Error'), t('Wrong Code'), BFNotificationType.Error);
                                            break;
                                        case SignInResponseResult.Success:
                                            if (result.data.authToken) {
                                                BitflexOpenApi.Init(result.data.authToken);

                                                if (result.data.email)
                                                    localStorage.setItem("obfuscatedEmail", result.data.email)

                                                if (result.data.rememberDeviceToken && rememberDevice) {
                                                    localStorage.setItem("rememberDeviceId", result.data.rememberDeviceToken)
                                                }

                                                setSignIn(result.data.authToken, result.data.expiryTimestamp)

                                                history('/wallet/assets', {
                                                    state: { requireSetPush: true }
                                                });
                                            } else {
                                                BFNotifictionRef.current?.Notify(t('Error'), t('Error on server side. Try again later'), BFNotificationType.Error);
                                            }
                                            break;
                                    }
                                })
                            }} />
                        </>
                        }
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center', verticalAlign: 'middle', marginTop: 10 }}>
                <p className="neon" >Flex Technologies Limited. 2021-{new Date().getFullYear()}</p>
            </div>
        </div>
    );
}