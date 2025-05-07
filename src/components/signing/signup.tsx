import '../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { PostSignUpRequest, SignUpResponseResult } from '../../api-wrapper/api';
import React, { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BitflexLogo from '../../images/bitflex-logo.svg';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from '../../Colors';
// import { Fireworks } from 'fireworks/lib/react'
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import loading_png from '../../images/loading.svg';
import { useCallback } from 'react';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';

export default function Signup() {

    let fxProps = {
        count: 2,
        interval: 2000,
        colors: [Colors.bitFlexGoldenColor, Colors.bitflexGolderColor2, Colors.bitFlexBloodRed],
        particleTimeout: 1000,
        calc: (props, i) => ({
            ...props,
            x: (i + 1) * (window.innerWidth / 3) - (i + 1) * 100 + 150,
            y: 200 + 150 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0)
        })
    }

    const [accountCreated, setaccountCreated] = useState(false);

    const [isFault, setisFault] = React.useState(false);
    const [faultMessage, setfaultMessage] = React.useState('');
    const [referrer, setreferrer] = useState('')

    useEffect(() => {
        var referrerLS = localStorage.getItem("refId");
        if (referrerLS !== null) {
            BitflexOpenApi.SignApi.apiSignGetreferreremailGet(referrerLS.replace('"', '').replace('"', '')).then(response => setreferrer(response.data))
        }
    }, [])

    const { t } = useTranslation();

    const [email, setemail] = useState<string>();
    const [password, setpassword] = useState<string>();
    const [passwordConf, setpasswordConf] = useState<string>();
    const [isEmailValid, setisEmailValid] = useState(false);
    const [isPassportValid, setisPassportValid] = useState(false);
    const [isPassportConfValid, setisPassportConfValid] = useState(false);

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const [isLoading, setisLoading] = useState(false);

    const onSubmit = useCallback(() => {

        if (!email || !password) {
            return;
        }

        setisLoading(true)

        var referrerLS = localStorage.getItem("refId");

        var signUpResuest: PostSignUpRequest = {
            email: email,
            password: password,
            // pinCode: data.pinCode,
            isInApp: false,
            refId: referrerLS?.replace('"', '').replace('"', '')
        };

        BitflexOpenApi.SignApi.apiVversionSignSignupPost("1.0", signUpResuest)
            .then(response => {

                switch (response.data.result) {
                    case SignUpResponseResult.BadInput:
                        setisFault(true)
                        setfaultMessage(t("Bad input"));
                        break;
                    case SignUpResponseResult.FailCreation:
                        // setisFault(true)
                        // setfaultMessage(response.data.error?.data[0]?.description);

                        BFNotifictionRef.current?.Notify(response.data.error?.message!, response.data.error?.data[0]?.description, BFNotificationType.Error);

                        break;
                    case SignUpResponseResult.SuccessEmailSent:
                        localStorage.removeItem("refId");
                        setaccountCreated(true)
                        break;
                }
            })
            .finally(() => {
                setisLoading(false)
            })
    }, [email, password, t]);

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

    if (accountCreated) {
        return (
            <div className="body-login login">
                <div className="logo">
                    <Link className="logo" to={'/terminal'}>
                        <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                    </Link>
                </div>
                <div className="content">
                    <div style={{ textAlign: "center" }}>
                        <img
                            className="widget-thumb-icon"
                            src={loading_png}
                            alt="Loading"
                        />
                        <h4 style={{ color: '#FFF' }}><Trans>Almost done</Trans>...</h4>
                        <p><Trans>Account created. We have sent you verification email. Please follow link from email to activate account</Trans></p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="body-login login" id="maindiv">

            {/* {referrer && <Fireworks {...fxProps} />} */}

            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                    <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                </Link>
            </div>

            {referrer && <div className="logo" style={{ padding: 0, margin: 0 }}>
                <span style={{ fontSize: 34, }}>Congratulations!</span>
                <br />  <br />
                <span style={{ fontSize: 16, color: Colors.bitFlexGoldenColor }}>You've been invited to BCFLEX Exchange</span>
            </div>
            }

            <div className="content">
                <BFNotification ref={BFNotifictionRef} />
                <div className='box-signup'>
                    <div id="stay-in-place" style={{ position: 'relative' }}>
                        <h3 className="form-title">Account Creation</h3>

                        <div className="login-form">
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label><Trans>Email</Trans></label>
                                <BFInput onValidated={setisEmailValid} type={BFInputType.Email} placeholder={t('Email')} onValue={setemail} isError={isFault} ErrorText={faultMessage} />
                            </div>
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

                            {referrer &&
                                <div style={{ borderWidth: 1, borderStyle: 'dashed', borderRadius: 5, borderColor: Colors.bitFlexGoldenColor, padding: 10, marginTop: 20 }}>
                                    <Trans>Your Referrer</Trans>: {referrer}
                                </div>
                            }

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginLeft: 2, marginRight: 3 }}>
                                <BFGradientButton isDisabled={!isEmailValid || !isPassportValid || !isPassportConfValid} isLoading={isLoading} buttonType={BFGradientButtonType.Action} text={t('Submit')} onPress={onSubmit} />

                            </div>

                            <div className="create-acc">
                                <p>
                                    <Link to="/signin">Already have account? <span style={{ color: '#cf8900' }}>Sign In</span></Link>
                                </p>
                            </div>

                        </div>
                        <div style={{ textAlign: 'center', opacity: 0.15 }}>This site is protected by reCAPTCHA and the Google
                            <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
                            <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center', verticalAlign: 'middle', marginTop: 10 }}>
                <p className="neon" >Flex Technologies Limited. 2021-{new Date().getFullYear()}</p>
            </div>
        </div>
    );
}