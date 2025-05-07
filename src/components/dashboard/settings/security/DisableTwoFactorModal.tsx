/* eslint-disable jsx-a11y/alt-text */
import '../../../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../../html/BFNotification';
import { GuardActionType, GuardRequestStatus, TwoStepVerificationTypes } from '../../../../api-wrapper/api';
import { useEffect, useRef, useState } from 'react';

import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import Colors from '../../../../Colors';
import OTPInput from '../../../html/BFOTPInput';
import loadimg_img from '../../../../images/loading.svg'
import mobunblock from "../../../../images/mobunblock.png"
import shield_png from '../../../../images/shield.png'
// import { useClientMethod } from 'react-use-signalr';
import { useSignalR } from '../../../../hooks/useSignalR';
import { useTranslation } from 'react-i18next';

export function DisableTwoFactorModal({
    onTitleChange,
    onClose
}: {
    isDash?: boolean,
    onClose?: Function,
    onTitleChange
}) {
    const { t } = useTranslation();

    const [twoStepVerificationType, settwoStepVerificationType] = useState<TwoStepVerificationTypes>();
    const [twoStepText, settwoStepText] = useState<string>();

    const [isLoading, setisLoading] = useState(true);
    const [isButtonLoading, setisButtonLoading] = useState(false);

    const { privateInstance } = useSignalR();


    useEffect(() => {
        BitflexOpenApi.UserApi.apiUserVerificationtypeGet()
            .then(response => {
                settwoStepVerificationType(response.data)

                switch (response.data) {
                    case TwoStepVerificationTypes.Bitflex:
                        settwoStepText("BCFLEX Guard")
                        break;

                    case TwoStepVerificationTypes.Google:
                        settwoStepText("Google Authenticator")
                        break;
                }
            })
            .finally(() => {
                setisLoading(false)
            })
    }, []);

    // useClientMethod(privateInstance, "guard_submit", (type: GuardActionType, status: GuardRequestStatus) => {
    //     if (type === GuardActionType.Disable) {
    //         switch (status) {
    //             case GuardRequestStatus.Accepted: window.location.reload(); return;
    //             case GuardRequestStatus.Declined: alert("Reuqest Rejected"); if (onClose) onClose(); return;
    //         }
    //     }
    // })

    const [title, setTitle] = useState<string>();
    const [OTP, setOTP] = useState("");

    let BFNotifictionRef = useRef<IBFNotification>(null);

    useEffect(() => {
        setTitle(t("Disable Two Step Verification System") + ": " + twoStepText)

        onTitleChange(title)
    }, [onTitleChange, t, title, twoStepText]);

    const RenderDisableGoogle = () => {
        return <div style={{ background: 'rgba(67, 60, 60, 0.2)', padding: 12, borderRadius: 4, paddingBottom: 10 }}>

            <BFNotification ref={BFNotifictionRef} />

            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 15, marginTop: 15 }}>
                <div>
                    <img src={shield_png} className="widget-thumb-icon" style={{ height: 50, marginRight: 10 }} alt={'two step icon'} />
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

            <div style={{ marginTop: 10 }}>
                <BFGradientButton
                    isLoading={isButtonLoading}
                    buttonType={BFGradientButtonType.Destructive}
                    width={'100%'}
                    isDisabled={OTP?.length !== 6}
                    text={t('Disable') + " " + twoStepText}
                    onPress={() => {
                        setisLoading(true)
                        BitflexOpenApi.UserApi.apiUserDisableGoogleAuthenticatorDelete(OTP)
                            .then(response => {
                                if (response.data.success) {
                                    window.location.reload();

                                    return;
                                }

                                BFNotifictionRef.current?.Notify(t('Failed'), t('Wrong Code'), BFNotificationType.Error);
                            })
                            .finally(() => setisLoading(false))


                    }}
                    onTwoStepActive={() => alert("!")}
                // requireTwoStep={true}
                />
            </div>
        </div>
    }

    // const RenderDisableGuard = () => {
    //     return (
    //         <div style={{ padding: 10, textAlign:'center' }}>
    //             <h3>Are you sure to disable BCFLEX Guard?</h3>
    //             <div className={'info-well warning'} style={{ margin: 15, marginLeft: 0, marginRight: 0, opacity: isButtonLoading ? 1 : 0, textAlign: 'left', lineHeight: '38px', fontSize: 20 }}>
    //                 Waiting for confirmation on your Device...
    //             </div>
    //             <BFGradientButton
    //                 isLoading={isButtonLoading}
    //                 buttonType={BFGradientButtonType.Destructive}
    //                 width={'100%'}
    //                 // isDisabled={OTP?.length !== 6}
    //                 text={t('Disable') + " " + twoStepText}
    //                 onPress={() => {
    //                     setisButtonLoading(true)
    //                     BitflexOpenApi.GuardApi.apiGuardRequestPost(GuardActionType.Disable).then(console.log)

    //                 }}
    //                 onTwoStepActive={() => alert("!")}
    //             />
    //         </div>
    //     )
    // }

    if (isLoading) return (
        <div style={{ padding: 10, textAlign: 'center' }}>

            <img src={loadimg_img} width={'50%'} />
        </div>
    )

    return RenderDisableGoogle();
}