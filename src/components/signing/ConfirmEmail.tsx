import '../../css/signlayout.css';

import { BFInput, BFInputType } from '../html/BFInput';
import { EmailConfirmationResult, PostConfirmRequest, SignInResponseResult } from '../../api-wrapper';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import BitflexLogo from '../../images/bitflex-logo.svg';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from '../../Colors';
import false_cross from '../../images/cross.png'
import ok_ok from '../../images/check.png'
import { isMobile } from 'react-device-detect';
import loading_png from '../../images/loading.svg';
import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import useQueryString from '../../hooks/useQueryString';
import useUserState from '../../hooks/useUserState';

const protect_email = function (user_email) {
    var splitted, part1;
    splitted = user_email.split("@");
    part1 = splitted[0];

    var cutted = part1.substring(1, part1.length - 1)
    var protectedEmail = part1.replace(cutted, "******")
    return protectedEmail + "@" + splitted[1];
};

export function ConfirmEmail() {

    const { setSignIn } = useUserState();

    const [userId] = useQueryString("userId", undefined);
    const [code] = useQueryString("code", undefined);

    const [userTelegram] = useQueryString("userTelegram", undefined);

    const [confirmationResult, setconfirmationResult] = useState<EmailConfirmationResult>();

    const [recaptchaToken, setrecaptchaToken] = useState('');

    const { executeRecaptcha } = useGoogleReCaptcha();
    const { bitflexDeviceId } = useBitflexDeviceId();

    const [password, setpassword] = useState<string>();
    const [passwordConf, setpasswordConf] = useState<string>();
    const [isEmailValid, setisEmailValid] = useState(false);
    const [isPassportValid, setisPassportValid] = useState(false);
    const [isPassportConfValid, setisPassportConfValid] = useState(false);

    let history = useNavigate();
    const { t } = useTranslation();

    const RefreshCaptchaAndRSAKey = useCallback(() => {
        if (executeRecaptcha)
            executeRecaptcha("login_page").then(token => {
                setrecaptchaToken(token)
            })
    }, [executeRecaptcha]);

    const Submit = useCallback(() => {

        var confirmEmail: PostConfirmRequest = {
            userId: userId,
            code: code,
            isInApp: false
        }

        BitflexOpenApi.SignApi.apiVversionSignConfirmemailPost("1.0", confirmEmail)
            .then(emailConfirmationResult => {
                setconfirmationResult(emailConfirmationResult.data)
            })


    }, [userId, code]);

    useEffect(() => {
        RefreshCaptchaAndRSAKey()
    }, [RefreshCaptchaAndRSAKey, executeRecaptcha]);

    const [passwordOnLogin, setPasswordOnLogin] = useState<string>();
    const [passwordOnLoginValid, setpasswordOnLoginValid] = useState(false);

    const [ispasswordError, setispasswordError] = useState(false);
    const [errorText, seterrorText] = useState<string>();

    const [isLoading, setisLoading] = useState(false);

    var historyRoute = useNavigate();

    const [passwordWasSet, setpasswordWasSet] = useState(false);

    const SubmitLogin = useCallback(() => {
        if (!confirmationResult) return;
        setisLoading(true)


        BitflexOpenApi.SignApi.apiVversionSignSigninPost("1.0", {
            email: confirmationResult.email!,
            password: passwordOnLogin!,
            reCaptchav3Token: recaptchaToken,
            bitflexDeviceId: bitflexDeviceId
        })
            .then(result => {
                switch (result.data.result) {
                    case SignInResponseResult.Success:
                        setSignIn(result.data.authToken, result.data.expiryTimestamp)
                        BitflexOpenApi.Init(result.data.authToken!);
                        history("/wallet/assets");
                        break;
                    case SignInResponseResult.WrongCredentials:
                        setispasswordError(true)
                        seterrorText(t("Wrong Credentials"))
                        break;
                    case SignInResponseResult.WrongPassword:
                        setispasswordError(true)
                        seterrorText(t("Wrong Password"))
                        break;
                    case SignInResponseResult.EmailNotConfirmed:
                        setispasswordError(true)
                        seterrorText(t("Email Not Confirmed"))
                        break;
                    case SignInResponseResult.RequireTwoFactor:
                        setispasswordError(true)
                        seterrorText(t("Require Two Factor"))
                        break;
                    default:
                        setispasswordError(true)
                        seterrorText(t("Unknown Error"))
                        break;
                }
            })
            .finally(() => {
                RefreshCaptchaAndRSAKey();
                setisLoading(false)
            })
    }, [RefreshCaptchaAndRSAKey, bitflexDeviceId, confirmationResult, history, passwordOnLogin, recaptchaToken, setSignIn, t])

    useEffect(() => {
        setTimeout(Submit, 100)
    }, [Submit]);

    if (passwordWasSet)
        return (
            <div className="body-login login" id="maindiv">
                <div className="logo">
                    <Link className="logo" to={'/terminal'}>
                        <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                    </Link>
                </div>
                <div className="content" style={{ minHeight: 450 }}>
                    <div style={{ textAlign: "center" }}>
                        <img
                            className="widget-thumb-icon"
                            src={ok_ok}
                            alt='ok_ok'
                            width={isMobile ? '50%' : 300}
                        />
                        <p>Password was set. Now you can enter BCFLEX Exchange</p>
                        <div style={{ paddingTop: 10 }}></div>
                        <BFGradientButton text='Continue to Sign In' to='/login' width={'100%'} onPress={() => {
                            history('/signin')
                        }} />
                    </div>
                </div>
            </div>
        );




    if (!confirmationResult)
        return (
            <div className="body-login login" id="maindiv">
                <div className="logo">
                    <Link className="logo" to={'/terminal'}>
                        <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                    </Link>
                </div>
                <div className="content" style={{ minHeight: 450 }}>
                    <div style={{ textAlign: "center" }}>
                        <img
                            className="widget-thumb-icon"
                            src={loading_png}
                            alt="Loading"
                        />
                        <h4 style={{ color: '#FFF' }}><Trans>Email confirmation in process</Trans>...</h4>
                    </div>
                </div>
            </div>
        );

    if (!confirmationResult.result)
        return (
            <div className="body-login login" id="maindiv">
                <div className="logo">
                    <Link className="logo" to={'/terminal'}>
                        <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                    </Link>
                </div>
                <div className="content" style={{ minHeight: 450, justifyContent: 'center' }}>
                    <div style={{ textAlign: "center", width: '100%', marginTop: 65 }}>
                        <img
                            className="widget-thumb-icon"
                            src={false_cross}
                            alt="Loading"
                            width={'50%'}
                        />
                        <h4 style={{ color: '#FFF' }}><Trans>Email confirmation failed</Trans></h4>
                        <p style={{ color: Colors.Graytext, fontSize: 10 }}>{confirmationResult.errorText}</p>
                    </div>

                </div>
            </div>
        );

    return (
        <div className="body-login login" id="maindiv">
            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                    <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                </Link>
            </div>
            <div className="content" style={{ minHeight: 450 }}>
                {confirmationResult &&
                    confirmationResult.result &&
                    <div style={{}}>
                        <div style={{ textAlign: 'center' }}>
                            <svg id="successAnimation" className="animated" xmlns="http://www.w3.org/2000/svg" width={180} height={180} viewBox="0 0 70 70">
                                <path id="successAnimationResult" fill="#35CB3Baa" d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z" />
                                <circle id="successAnimationCircle" cx={35} cy={35} r={24} stroke="#979797" strokeWidth={2} strokeLinecap="round" fill="transparent" />
                                <polyline id="successAnimationCheck" stroke="#979797" strokeWidth={2} points="23 34 34 43 47 27" fill="transparent" />
                            </svg>
                            <p style={{ fontSize: 15 }}><Trans>Your email</Trans> <span style={{ color: 'rgb(53, 203, 59)' }}>{protect_email(confirmationResult.email)}</span> <Trans>has been successfully confirmed</Trans></p>
                        </div>

                        {confirmationResult.isPasswordSetupRequired
                            ? <>
                                <p>Please set up password to contiunue</p>
                                <div className="form-group">
                                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                                        <label className="control-label"><Trans>Password</Trans></label>
                                        <BFInput onValidated={setisPassportValid} type={BFInputType.Password} placeholder={t('Password')} onValue={setpassword} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                                        <label className="control-label"><Trans>Password Confirmation</Trans></label>
                                        <BFInput
                                            type={BFInputType.Password}
                                            placeholder={t('Re-type password')}
                                            onValue={setpasswordConf} onValidated={setisPassportConfValid}
                                            shouldBeEqualTo={password} shouldBeEqualErrorMessage={t('Passwords does not match')}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginLeft: 2, marginRight: 3 }}>
                                        <BFGradientButton isDisabled={!isPassportValid || !isPassportConfValid} isLoading={isLoading} buttonType={BFGradientButtonType.Action} text={t('Submit')} onPress={() => {
                                            BitflexOpenApi.SignApi.apiSignSetPasswordPost(userId, code, password).then(result => {
                                                if (result.data.succeeded) {
                                                    setpasswordWasSet(true)
                                                }
                                                else {
                                                    if (result.data.errors)
                                                        alert(result.data.errors[0].description)
                                                }
                                            })
                                        }} />
                                    </div>
                                </div>
                            </>
                            : <div className="form-group">
                                <label className="control-label"><Trans>Type your Password</Trans></label>
                                <BFInput type={BFInputType.Password} placeholder={t("Password")} onValue={(value) => {
                                    setispasswordError(false)
                                    seterrorText(undefined)
                                    setPasswordOnLogin(value)
                                }} onValidated={setpasswordOnLoginValid} isError={ispasswordError} ErrorText={errorText} />
                                <div style={{ marginTop: 20 }}></div>
                                <BFGradientButton isLoading={isLoading} isDisabled={!passwordOnLoginValid} text='Access my Account' onPress={SubmitLogin} width={'100%'} />
                            </div>
                        }
                    </div>
                }
            </div>
        </div>
    );
}