import { BFGradientButton, BFGradientButtonType } from '../../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../../html/BFInput';
import { ParameterType, TwoStepVerificationTypes } from '../../../../api-wrapper/api';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ActionType } from '../../../../store/actionTypes';
import { BFModalWindow } from '../../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import { ChangePasswordModal } from './ChangePasswordModal';
import Colors from '../../../../Colors';
import { DisableTwoFactorModal } from './DisableTwoFactorModal';
// import { EnableTwoFactor } from './EnableTwoFactor';
import { FaExclamationTriangle } from 'react-icons/fa';
import { IState } from '../../../../store/types';
import { RequestSettingsTokenOverlay } from './RequestSettingsTokenOverlay';
import { RequestSettingsTokenResponseModel } from '../../../../api-wrapper';
import SecureLS from 'secure-ls';
import { SetBlur } from '../../../../store/actions';
import { StaticPagesLayout } from '../../../staticpages/StaticPagesLayout';
import { Store } from '../../../../store';
import { isMobile } from 'react-device-detect';
import { useBitflexDeviceId } from '../../../../hooks/useBitflexDeviceId';
import { useCallback } from 'react';
import EnableTwoFactor from './EnableTwoFactor';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function Security() {
    const {
        state: { },
        dispatch
    } = React.useContext(Store);

    const {
        settings
    } = React.useContext(Store).state as IState;

    const [isLoading, setisLoading] = useState(false);

    const { bitflexDeviceId } = useBitflexDeviceId();

    const [ls] = useState(new SecureLS({ encodingType: 'rc4', isCompression: false }));

    const { t } = useTranslation();

    const [isPasswordChangeModalActive, setisPasswordChangeModalActive] = useState(false);
    const [modalTitle, setmodalTitle] = useState('');
    const [isEnableTwoStepModalActive, setisEnableTwoStepModalActive] = useState(false);

    const [isDisableTwoStepModalActive, setisDisableTwoStepModalActive] = useState(false);


    const [isSessionLifetimeChangingActive, setisSessionLifetimeChangingActive] = useState(false);


    const [isTfaButtonLoading, setisTfaButtonLoading] = useState(false);



    useEffect(() => {
        if (dispatch)
            SetBlur(isEnableTwoStepModalActive, dispatch)
    }, [dispatch, isEnableTwoStepModalActive]);

    useEffect(() => {
        SetBlur(isEnableTwoStepModalActive, dispatch);
    }, [dispatch, isEnableTwoStepModalActive])

    let isOverlayActive = settings == null || settings?.expiration! < Math.floor(Date.now() / 1000);



    const tfaButtonSwitchRender = useCallback((type: TwoStepVerificationTypes) => {
        switch (type) {
            case TwoStepVerificationTypes.Bitflex:
                return <BFGradientButton isLoading={isTfaButtonLoading} buttonType={BFGradientButtonType.Destructive} text={t('Disable Guard')} width={130} onPress={() => setisDisableTwoStepModalActive(true)} />
            case TwoStepVerificationTypes.Google:
                return <BFGradientButton isLoading={isTfaButtonLoading} buttonType={BFGradientButtonType.Destructive} text={t('Disable OTP')} width={130} onPress={() => setisDisableTwoStepModalActive(true)} />
            default:
                return isOverlayActive ? <></> : <BFGradientButton isLoading={isTfaButtonLoading} buttonType={BFGradientButtonType.Green} onPress={() => setisEnableTwoStepModalActive(true)} text={t('SETUP TFA')} />
        }
    }, [isOverlayActive, isTfaButtonLoading, t]);



    // const lockButtonSwitchRender = () => {

    //     var lsTimeValue = ls.get('terminalLockoutTime');

    //     console.log("ls.get('terminalLockoutTime')", lsTimeValue)

    //     if (!lsTimeValue) {
    //         return <BFGradientButton buttonType={BFGradientButtonType.Green} text={t('ENABLE')} width={130} onPress={() => {

    //             ls.set('terminalLockoutTime', 10)


    //         }} />
    //     }
    //     else {
    //         return <BFGradientButton buttonType={BFGradientButtonType.Action} text={t('CHANGE')} width={130} onPress={() => {

    //             ls.remove('terminalLockoutTime')
    //         }} />
    //     }


    //     // if(!isLockoutTimeEnabled)


    //     //     case TwoStepVerificationTypes.Google:
    //     //         return <BFGradientButton buttonType={BFGradientButtonType.Destructive} text={t('Disable OTP')} width={130} />
    //     //     default:
    //     //         return isOverlayActive ? <></> : <BFGradientButton buttonType={BFGradientButtonType.Green} onPress={() => setisEnableTwoStepModalActive(true)} text={t('SETUP TFA')} />
    //     // }
    // }


    const sesstionLifeTimeRender = useCallback(() => {
        return <div style={styles.lastRow}>
            <div>
                <div style={styles.headerStyle}>
                    Session Lifetime
                </div>
                <div style={styles.headerInformation}>Set lifetime (in Minutes) for Access Token. Without <span style={{ color: '#cf8900' }}> BCFLEX Guard</span> will take effect only after current Token expired. </div>
            </div>
            <div style={styles.subHeaderStyle}>
                {isSessionLifetimeChangingActive
                    ? <div style={{ fontSize: 15, display: 'inline-flex', justifyContent: 'space-around', marginTop: 1, width: 130 }}>
                        <BFInput type={BFInputType.Int} setValue={settings?.sessionLifeTimeMinutes} onDebouncedValue={(value: number) => {
                            if (value > 0)
                                BitflexOpenApi.UserApi.apiUserSetparametersPost(ParameterType.SessionLifetime, settings?.token!, value)
                                    .then(settingsToken => {
                                        dispatch({
                                            type: ActionType.SET_ACCOUNT_SETTINGS,
                                            payload: settingsToken.data
                                        });
                                   })
                                    .catch((error) => alert("Settings not saved. Wrong token? " + error))
                        }} />
                        <div style={{ margin: 1, marginLeft: 7 }}>
                            <BFGradientButton buttonType={BFGradientButtonType.FormSaveSquare} width={42} onPress={() => setisSessionLifetimeChangingActive(false)} />
                        </div>
                    </div>
                    : <BFGradientButton
                        buttonType={BFGradientButtonType.Action}
                        text={'CHANGE'}
                        onPress={() => {
                            setisSessionLifetimeChangingActive(true)
                        }}
                    />
                }
            </div>
        </div>
    }, [dispatch, isSessionLifetimeChangingActive, settings])


    // const lockoutTerminalTimer = useCallback(() => {
    //     return <div style={styles.lastRow}>
    //         <div>
    //             <div style={styles.headerStyle}>
    //                 Session Lifetime
    //             </div>
    //             <div style={styles.headerInformation}>Set lifetime for Access Token. Without <span style={{ color: '#cf8900' }}> BCFLEX Guard</span> will take effect only after current Token expired. </div>
    //         </div>
    //         <div style={styles.subHeaderStyle}>
    //             {isSessionLifetimeChangingActive
    //                 ? <div style={{ fontSize: 15, display: 'inline-flex', justifyContent: 'space-around', marginTop: 1 }}>
    //                     <BFInput type={BFInputType.Int} leftsideSymbol={'Minutes'} setValue={settings?.sessionLifeTimeMinutes} onDebouncedValue={(value: number) => {
    //                         if (value > 0)
    //                             BitflexOpenApi.UserApi.apiUserSetparametersPost(ParameterType.SessionLifetime, settings?.token!, value)
    //                                 .then(settingsToken => {
    //                                     console.log("YOP")
    //                                     dispatch({
    //                                         type: ActionType.SET_ACCOUNT_SETTINGS,
    //                                         payload: settingsToken.data
    //                                     });
    //                                 })
    //                                 .catch((error) => alert("Settings not saved. Wrong token? " + error))
    //                     }} />
    //                     <div style={{ margin: 1, marginLeft: 7 }}>
    //                         <BFGradientButton buttonType={BFGradientButtonType.FormSaveSquare} width={42} onPress={() => setisSessionLifetimeChangingActive(false)} />
    //                     </div>
    //                 </div>
    //                 : <BFGradientButton
    //                     buttonType={BFGradientButtonType.Action}
    //                     text={'CHANGE'}
    //                     onPress={() => setisSessionLifetimeChangingActive(true)}
    //                 />
    //             }
    //         </div>
    //     </div>
    // }, [dispatch, isSessionLifetimeChangingActive, settings])

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
            isOverlayActive={isOverlayActive}
        >
            <BFModalWindow title={modalTitle} isOpen={isEnableTwoStepModalActive} onClose={() => setisEnableTwoStepModalActive(false)}>
                <EnableTwoFactor isDash={true} onClose={() => setisEnableTwoStepModalActive(false)} onTitleChange={setmodalTitle} />
            </BFModalWindow>

            <BFModalWindow title={modalTitle} isOpen={isDisableTwoStepModalActive} onClose={() => setisDisableTwoStepModalActive(false)}>
                <DisableTwoFactorModal isDash={true} onClose={() => setisDisableTwoStepModalActive(false)} onTitleChange={setmodalTitle} />
            </BFModalWindow>

            <ChangePasswordModal isActive={isPasswordChangeModalActive} onCancel={() => setisPasswordChangeModalActive(false)} />

            <div className={'bf-dash-header'}>
                <h1 className={'bf-dashboard-title'}><Trans>Security Settings</Trans></h1>
            </div>

            <div>
                <div style={styles.rowStyle}>
                    <div>
                        <div style={styles.headerStyle}>
                            <Trans>Password</Trans>
                        </div>
                        <div style={styles.headerInformation}><Trans>Update your password</Trans></div>
                    </div>
                    <div style={styles.subHeaderStyle}>
                        <BFGradientButton
                            buttonType={BFGradientButtonType.Action}
                            text={'CHANGE'}
                            onPress={() => setisPasswordChangeModalActive(true)}
                            width={130}
                        />
                    </div>
                </div>

                <div style={styles.rowStyle}>
                    <div>
                        <div style={styles.headerStyle}>
                            Support Code
                        </div>
                        <div style={styles.headerInformation}>We will ask you for this code on Support Request.</div>
                    </div>
                    <div style={styles.subHeaderStyle}>
                        <div style={{ width: 130, textAlign: 'right' }}> {settings?.supportPIN! > 0 ? settings?.supportPIN : '****'}</div>

                    </div>
                </div>

                <div style={styles.rowStyle}>
                    <div>
                        <div style={styles.headerStyle}>
                            2-Step Verification
                        </div>
                        <div style={styles.headerInformation}>
                            Protect your funds and account with Two Step Authentication.
                            Status: {settings?.verificationTypes ? <span style={{ color: 'green' }}>Enabled {settings?.verificationTypes === TwoStepVerificationTypes.Bitflex ? <> BCFLEX Guard</> : <>Google Authenticator</>}</span> : <span style={{ color: 'red' }}>Disabled</span>}</div>
                    </div>
                    <div style={styles.subHeaderStyle}>
                        {tfaButtonSwitchRender(settings?.verificationTypes!)}
                    </div>
                </div>

                {sesstionLifeTimeRender()}

                {/* <div style={styles.lastRow}>
                    <div>
                        <div style={styles.headerStyle}>
                            Auto Lockout
                        </div>
                        <div style={styles.headerInformation}>Lock Trading Terminal after idle period on current device. Type '0' to turn off.</div>
                    </div>
                    <div style={styles.subHeaderStyle}>
                        {lockButtonSwitchRender()}
                    </div>
                </div> */}


            </div>
        </StaticPagesLayout>
    );
}

const styles: StylesDictionary = {
    rowStyleNoBorder: {
        display: 'flex',
        color: 'white',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35,
        fontSize: 24,
        cursor: 'pointer'
    },

    rowStyle: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#bdbdbd',
        borderBottomStyle: 'dashed',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35
    },

    lastRow: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35,
        borderBottomWidth: 0
    },
    headerStyle: {
        color: 'white', fontWeight: 400, fontSize: 21
    },
    subHeaderStyle: {
        color: '#cf8900', fontWeight: 500, fontSize: 22
    },
    headerInformation: {
        paddingRight: 15
    }
}
