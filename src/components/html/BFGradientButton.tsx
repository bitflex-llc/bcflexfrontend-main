import * as blockies from 'blockies-ts';

import { BFNotificationType, IBFNotification } from './BFNotification';
import { ChangePasswordRequest, GuardActionType, PostWithdrawRequest, TwoStepVerificationTypes, WithdrawErrorCode } from '../../api-wrapper/api';
import React, { RefObject, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { BFModalWindow } from './BFModalWindow';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from "../../Colors";
import { FaCheck } from 'react-icons/fa';
import { ICurrency } from '../../store/types';
import { Link } from 'react-router-dom';
import OTPInput from './BFOTPInput';
import { Store } from "../../store";
import bitflex_guard_icon from '../../images/shield.png'
import check from '../../images/check.png'
import google_auth_icon from '../../images/google-authenticator-2.svg'
import loading_png from '../../images/loading.svg'
import { useCallback } from 'react';
import { useSignalR } from '../../hooks/useSignalR';

export enum BFGradientButtonType {
    Action,
    GoldenBorderActionSmall,
    Warning,
    Destructive,
    DestructiveSmall,
    Shadow,
    Green,
    GreenBorder,
    GoldenBorder,
    FormSaveSquare,
    TelegramColor
    
}

function GetClass(_buttonType: BFGradientButtonType): string {
    switch (_buttonType) {
        case BFGradientButtonType.Action: return 'bf-btn-gradient';
        case BFGradientButtonType.GoldenBorderActionSmall: return 'bf-btn-small';
        case BFGradientButtonType.Destructive: return 'bf-btn-gradient-destructive';
        case BFGradientButtonType.Shadow: return 'bf-btn-whiteshadow';
        case BFGradientButtonType.Green: return 'bf-btn-gradient-green';
        case BFGradientButtonType.GoldenBorder: return 'bf-btn-golden-borger';

        case BFGradientButtonType.GreenBorder: return 'bf-btn-green-borger';
        case BFGradientButtonType.FormSaveSquare: return 'bf-btn-form-save-square';
        case BFGradientButtonType.DestructiveSmall: return 'bf-btn-small-destructive';

        case BFGradientButtonType.TelegramColor: return 'bf-btn-telegram';

    }

    return 'bf-btn-gradient';
}


export const BFGradientButton = ({
    isLinkButton = false,
    isDisabled = false,
    isLoading = false,
    isExtra = false,
    onPress,
    onPrePress,
    onTfaChallenge,
    text,
    buttonType = BFGradientButtonType.Action,
    width = 130,
    to,
    marginRight = 0,
    requireTwoStep = false,
    twoStepOverlayDiv,
    onTwoStepActive,
    verificationAction,
    postWithdrawRequest,
    changePasswordRequestData,
    onActionConfirmationCancel,

    onGuardResult,
    onClose,

    BFNotificationRef,

    image

}: {
    isLinkButton?: boolean,
    isDisabled?: boolean,
    isLoading?: boolean,
    isExtra?: boolean,
    onPress?,
    onPrePress?,
    onTfaChallenge?,
    text?: string,
    buttonType?: BFGradientButtonType,
    width?: number | string,
    to?: string,
    marginRight?: number,
    requireTwoStep?: boolean,
    twoStepOverlayDiv?: RefObject<HTMLDivElement>,
    onTwoStepActive?,
    onGoogleAuthCodeEntered?,
    verificationAction?: GuardActionType
    postWithdrawRequest?: PostWithdrawRequest,
    changePasswordRequestData?: ChangePasswordRequest
    onActionConfirmationCancel?: Function,
    onActionUUIDReceived?: Function,

    onGuardResult?: Function,
    onClose?: Function,

    BFNotificationRef?: IBFNotification,

    image?: JSX.Element


}): JSX.Element => {

    const {
        state: { currencies, },
        dispatch
    } = React.useContext(Store);

    const { t } = useTranslation();

    const [isLoadingInside, setisLoadingInside] = useState(isLoading);
    const [twoStepType, settwoStepType] = useState<TwoStepVerificationTypes>();
    const [OTP, setOTP] = useState("");

    const [isActionConfirmed, setisActionConfirmed] = useState(false);

    const [isGoogleModalActive, setisGoogleModalActive] = useState(false);

    const [isBitflexGuardModalActive, setisBitflexGuardModalActive] = useState(false);
    const [isBitflexGuardDeviceActive, setisBitflexGuardDeviceActive] = useState(false);

    const { Onweb_mobileactivate, On_web_passwordchange_confirm, On_withdraw_result, privateInstance } = useSignalR();

    const [isWithdrawSuccess, setisWithdrawSuccess] = useState(false);

    /// Withdraw
    const [isAddressChecked, setisAddressChecked] = useState(false);
    const [isAmountChecked, setisAmountChecked] = useState(false);

    useEffect(() => {
        setisLoadingInside(isLoading)
    }, [isLoading]);

    useEffect(() => {

        if (requireTwoStep) {
            setisLoadingInside(true)
            BitflexOpenApi.UserApi.apiVversionUserVerificationtypeGet("1.0",)
                .then(response => settwoStepType(response.data))
                .finally(() => setisLoadingInside(false))
        }
    }, [requireTwoStep]);

    const RightsRow = useCallback((
        {
            isChecked,
            setChecked,
            label,
            text,
            isAddress,
            noConfirmation = false
        }: {
            isChecked: boolean,
            setChecked,
            label: string,
            text: string,
            isAddress?: boolean,
            noConfirmation?: boolean
        }): JSX.Element => {

        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => {
            if (!noConfirmation)
                setChecked(!isChecked)
        }}>
            <div style={{
                marginTop: 0, marginBottom: 10, background: isChecked ? Colors.bitFlexGoldenColor : 'transparent', borderRadius: 4,
                padding: 10, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGoldenColor : 'grey'

            }}>
                <div>
                    <div style={{ fontSize: 20, color: 'white' }}>{label}</div>
                    <div style={{ fontSize: 14, color: 'rbga(255,255,255,0.8)', overflowWrap: 'anywhere' }}>{text}</div>
                </div>
                {!noConfirmation &&
                    <div>
                        <FaCheck style={{ fontSize: 20, color: 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                    </div>
                }
            </div>
        </div>
    }, []);

    const RenderAdditionalVerificationList = useCallback((verificationAction) => {

        switch (verificationAction) {
            case GuardActionType.Withdraw: {
                return <>
                    <RightsRow label={'CHECK THE ADDRESS'} text={postWithdrawRequest?.address!} isChecked={isAddressChecked} setChecked={setisAddressChecked} />
                    <RightsRow label={'CHECK THE AMOUNT'} text={postWithdrawRequest?.amount?.toFixed(8) + " " + postWithdrawRequest?.currency!} isChecked={isAmountChecked} setChecked={setisAmountChecked} />
                </>
            }
        }
    }, [RightsRow, isAddressChecked, isAmountChecked, postWithdrawRequest])

    useEffect(() => {
        On_web_passwordchange_confirm(() => {
            twoStepOverlayDiv?.current?.classList.remove("invisible")
            setisBitflexGuardModalActive(false)
        });

        Onweb_mobileactivate((isActivated, deviceName, ip, lat, lng, deviceIdr) => {
            if (isActivated)
                setisBitflexGuardDeviceActive(true)
        });

        On_withdraw_result((result) => {
            setisBitflexGuardModalActive(false)
            onGuardResult && onGuardResult(result)
        });

    }, [])


    const RenderGoogleAutenticator = useCallback((): JSX.Element => {
        if (isWithdrawSuccess)
            return <div style={{ margin: 10, textAlign: 'center' }}>
                <img src={check} width={'35%'} alt={'img'} />
                <h3 style={{ color: Colors.bitFlexGreenColor }}>Withdraw Queued</h3>
                <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text={'Close'} width={'80%'} onPress={() => {
                    setisGoogleModalActive(false)
                    setisWithdrawSuccess(false)
                    if (onClose)
                        onClose()
                }} />
            </div>

        return (
            <div style={{ margin: 10 }}>
                <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, marginTop: 10, paddingBottom: 0 }}>
                    <div style={{ marginBottom: 10 }}>1. Confirm address and amount</div>
                    {RenderAdditionalVerificationList(verificationAction)}
                </div>
                <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, marginTop: 10, paddingBottom: 10 }}>
                    <div style={{ marginBottom: 10 }}>2. Enter One-Time-Password</div>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 15, marginTop: 15 }}>
                        <div>
                            <img src={bitflex_guard_icon} className="widget-thumb-icon" style={{ height: 50, marginRight: 10 }} alt={'two step icon'} />
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
                                setOTP(otp)
                        }}
                    />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <BFGradientButton buttonType={BFGradientButtonType.Action} width={'100%'}
                        text={'Submit Withdraw'}
                        onPress={() => {

                            switch (verificationAction) {
                                case GuardActionType.Withdraw: {

                                    const insideWithdrawRequest: PostWithdrawRequest = postWithdrawRequest!;
                                    insideWithdrawRequest.googleAuthenticatorCode = OTP;

                                    BitflexOpenApi.BalanceApi.apiVversionBalanceWithdrawPost("1.0", insideWithdrawRequest)
                                        .then(response => {
                                            if (!response.data.success && response.data.withdrawErrorCode) {
                                                BFNotificationRef?.Notify("Withdraw Error", "Status Code: " + WithdrawErrorCode[response.data.withdrawErrorCode], BFNotificationType.Error);
                                            }
                                            else if (response.data.success) {
                                                setisWithdrawSuccess(true)
                                            }
                                            else {
                                                BFNotificationRef?.Notify("Withdraw Error", "Unknown status code", BFNotificationType.Error);
                                            }
                                        })
                                    break;
                                }
                            }
                        }}

                        isDisabled={!(isAddressChecked && isAmountChecked && OTP.length === 6)}
                    />

                </div>
            </div>
        );
    }, [OTP, RenderAdditionalVerificationList, isAddressChecked, isAmountChecked, isWithdrawSuccess, postWithdrawRequest, verificationAction]);

    const GuardAdditionalDataRenderSwitch = useCallback(() => {
        var currencyIn = currencies.find(x => x.name.toLowerCase() === postWithdrawRequest?.currency.toLowerCase()) as ICurrency;

        switch (verificationAction) {
            case GuardActionType.Withdraw: {
                return (postWithdrawRequest && currencyIn) && <>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', border: '1.5px dashed ' + Colors.bitFlexGoldenColor, borderRadius: 4, padding: 25, margin: 15 }}>
                        <div><img width={64} src={blockies.create({ seed: postWithdrawRequest?.address, size: 8, scale: 8 }).toDataURL()} alt="blockie" /></div>
                        <div style={{ marginLeft: 20, overflowWrap: 'anywhere' }}>
                            <div style={{ fontSize: 23 }}>CHECK THE ADDRESS</div>
                            <div style={{ fontSize: 20 }}>{postWithdrawRequest?.address}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', border: '1.5px dashed ' + Colors.bitFlexGoldenColor, borderRadius: 4, padding: 25, margin: 15, marginBottom: 0 }}>
                        <div><img src={currencyIn.imageBase64} width={64} alt="blockie" /></div>
                        <div style={{ marginLeft: 20 }}>
                            <div style={{ fontSize: 23 }}>CHECK THE AMOUNT</div>
                            <div style={{ fontSize: 20 }}>{postWithdrawRequest?.amount?.toFixed(8)} {currencyIn.name}</div>
                        </div>
                    </div>
                </>
            }
        }
    }, [currencies, postWithdrawRequest, verificationAction]);



    const GuardModalWithdraw = useCallback(() => {
        return (
            <div style={{ margin: 10, position: 'relative' }}>

                <div>
                    <div style={{ textAlign: 'center', fontSize: 20 }}>
                        This action is protected with BCFLEX Guard
                    </div>
                    {GuardAdditionalDataRenderSwitch()}

                    <div style={{ textAlign: 'center', }}>
                        <img src={loading_png} width={'20%'} alt='guard icon' />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h4>Waiting for confirmation on your device...</h4>
                    </div>
                </div>
            </div>
        );
    }, [GuardAdditionalDataRenderSwitch]);

    useEffect(() => {
        if (isGoogleModalActive || isBitflexGuardModalActive)
            twoStepOverlayDiv?.current?.classList.add("blurred")
        else
            twoStepOverlayDiv?.current?.classList.remove("blurred")

    }, [dispatch, isBitflexGuardModalActive, isGoogleModalActive, twoStepOverlayDiv]);

    const prePress = () => {


        if (onPrePress) onPrePress();

        if (requireTwoStep && !isActionConfirmed) {


            if (onTwoStepActive)
                onTwoStepActive();

            if (twoStepType === TwoStepVerificationTypes.Bitflex) {
                switch (verificationAction) {

                    case GuardActionType.Withdraw:
                        BitflexOpenApi.BalanceApi.apiBalancePrewithdrawPost(postWithdrawRequest).then(preWithdrawResponse => {
                            if (!preWithdrawResponse.data.success) {
                                BFNotificationRef?.Notify("Withdraw Error", "Error Status Code: " + preWithdrawResponse.data.errorCode, BFNotificationType.Error);
                                return;
                            }

                            setisLoadingInside(true)
                            BitflexOpenApi.GuardApi.apiVversionGuardRequestPost("1.0", verificationAction, {
                                withdrawRequestModel: {
                                    address: postWithdrawRequest?.address!,
                                    amount: postWithdrawRequest?.amount!,
                                    currency: postWithdrawRequest?.currency!
                                }
                            })
                                .then(response => response.data.success && setisBitflexGuardModalActive(true))
                                .finally(() => setisLoadingInside(false))
                        })
                        break;

                    case GuardActionType.ChangePassword:
                        BitflexOpenApi.GuardApi.apiVversionGuardRequestPost("1.0", verificationAction, {
                            changePasswordRequestModel: {
                                oldPassword: changePasswordRequestData?.oldPassword!,
                                newPassword: changePasswordRequestData?.newPassword!
                            }
                        })
                            .then(response => {
                                if (response.data.success) {
                                    twoStepOverlayDiv?.current?.classList.add("invisible")
                                    setisBitflexGuardModalActive(true)
                                }
                            })
                            .finally(() =>
                                setisLoadingInside(false)
                            )
                        break;

                    case GuardActionType.SignIn:
                        break;
                }
            }
            else
                setisGoogleModalActive(true)
        }
        else {
            if (onPress)
                onPress()
        }
    }

    if (isLinkButton && to)
        return (
            <Link className={GetClass(buttonType) + " font-roboto"} to={to} style={{ marginRight: marginRight, width: width }}>
                {text}
            </Link>
        )

    return <div style={{ position: 'relative' }}>
        {(requireTwoStep && twoStepType === TwoStepVerificationTypes.Google) && <BFModalWindow isOpen={isGoogleModalActive} title={'Google Authenticator'} onClose={() => {
            setisGoogleModalActive(false)
            setisLoadingInside(false)

            setisWithdrawSuccess(false)

            if (onActionConfirmationCancel)
                onActionConfirmationCancel();
        }}>
            {RenderGoogleAutenticator()}
        </BFModalWindow>}

        {/* {(requireTwoStep && twoStepType === TwoStepVerificationTypes.Bitflex) && <BFModalWindow isOpen={isBitflexGuardModalActive} title={' BCFLEX Guard'} onClose={() => {
            setisBitflexGuardModalActive(false)
            setisLoadingInside(false)

            setisWithdrawSuccess(false)

            BitflexOpenApi.BalanceApi.apiBalanceWithdrawstatusPut(false)

            if (onActionConfirmationCancel)
                onActionConfirmationCancel();
        }}>
            {GuardModalWithdraw()}
        </BFModalWindow>} */}


        {image &&
            <div style={{ position: 'absolute', zIndex: 10, bottom: -4, left: 25 }}>
                {image}
            </div>}
        <button
            className={GetClass(buttonType) + " font-roboto"}
            disabled={(isDisabled || isLoading)}
            style={{ overflow: 'hidden', width: width, opacity: (isDisabled || isLoading || isLoadingInside) ? 0.3 : 1, cursor: isDisabled ? 'default' : 'pointer', marginRight: marginRight }} onClick={prePress}>
            {
                !isLoadingInside && twoStepType && <img src={twoStepType === TwoStepVerificationTypes.Bitflex ? bitflex_guard_icon : google_auth_icon} className="widget-thumb-icon" style={{ height: 25, marginBottom: -6, marginRight: 7 }} alt={'two step icon'} />
            }
            {
                isLoadingInside
                    ? <img
                        className="widget-thumb-icon"
                        src={loading_png}
                        alt="Loading"
                        style={{ height: 90, marginTop: -27, marginBottom: -30 }
                        }
                    />
                    : buttonType === BFGradientButtonType.FormSaveSquare
                        ? <FaCheck color={Colors.bitFlexGreenColor} />
                        : text
            }
        </button>
    </div>
}

