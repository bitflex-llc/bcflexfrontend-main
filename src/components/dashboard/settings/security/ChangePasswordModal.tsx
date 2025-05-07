/* eslint-disable jsx-a11y/alt-text */
import 'moment-timezone';

import { BFGradientButton, BFGradientButtonType } from '../../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../../../html/BFNotification';
import { GuardActionType, GuardRequestStatus } from '../../../../api-wrapper/api';
import React, { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
// import { useClientMethod, useHub } from 'react-use-signalr'

import { BFModalWindow } from '../../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import { SetBlur } from '../../../../store/actions';
import { Store } from '../../../../store';
import checkImage from '../../../../images/check.png'
import { isMobile } from 'react-device-detect';
import { useSignalR } from '../../../../hooks/useSignalR';
import { useState } from 'react';

export function ChangePasswordModal({ isActive, onCancel }: { isActive: boolean, onCancel: () => void }) {

    const {
        dispatch
    } = React.useContext(Store);

    const { privateInstance } = useSignalR();


    useEffect(() => {
        SetBlur(isActive, dispatch)
    }, [dispatch, isActive]);


    // useClientMethod(privateInstance, "guard_submit", (type: GuardActionType, status: GuardRequestStatus) => {
    //     if (type === GuardActionType.ChangePassword) {
    //         switch (status) {
    //             case GuardRequestStatus.Accepted: window.location.reload(); return;
    //             case GuardRequestStatus.Declined: alert("Reuqest Rejected"); if (onCancel) onCancel(); return;
    //         }
    //     }
    // })

    const [oldPassword, setoldPassword] = useState<string | undefined>();
    const [password, setpassword] = useState<string>();
    const [passwordConf, setpasswordConf] = useState<string>();

    const [isoldPasswordValid, setisoldPasswordValid] = useState(false);
    const [isPassportValid, setisPassportValid] = useState(false);
    const [isPassportConfValid, setisPassportConfValid] = useState(false);

    const [isSuccessChanged, setisSuccessChanged] = useState(false);
    const [isLoading, setisLoading] = useState(false);

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const { t } = useTranslation();

    const divRef = useRef<HTMLDivElement>(null);

    // useClientMethod(privateInstance, "web_passwordchange_confirm", (actionUUID) => {
    //     console.log(actionUUID, oldPassword, password)
    //     setisLoading(true)

    // });

    return (
        <>
            <BFModalWindow isOpen={isActive} title={t('Password Changing')} onClose={onCancel}>
                <BFNotification ref={BFNotifictionRef} />
                <div className="row bf-row" ref={divRef}>
                    {isSuccessChanged
                        ? <>
                            <div style={{ textAlign: 'center' }}>
                                <img src={checkImage} width={'35%'} style={{ marginBottom: 15 }} />
                                <h3>Password successfully changed</h3>

                                <BFGradientButton
                                    buttonType={BFGradientButtonType.Green}
                                    text={t('Continue')}
                                    onPress={() => {
                                        setisSuccessChanged(false)
                                        onCancel();
                                    }}
                                />
                            </div>
                        </>
                        : <>
                            <div style={{ display: 'flex', flexDirection: 'column', }}>
                                <label className="control-label"><Trans>OLD PASSWORD</Trans></label>
                                <BFInput
                                    onValidated={setisoldPasswordValid}
                                    type={BFInputType.Password}
                                    placeholder={t('Old Password')}
                                    onValue={setoldPassword}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                                <label className="control-label"><Trans>NEW PASSWORD</Trans></label>
                                <BFInput
                                    onValidated={setisPassportValid}
                                    type={BFInputType.Password}
                                    placeholder={t('Password')}
                                    onValue={setpassword}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                                <label className="control-label"><Trans>NEW PASSWORD CONFIRMATION</Trans></label>
                                <BFInput
                                    type={BFInputType.Password}
                                    placeholder={t('Re-type password')}
                                    onValue={setpasswordConf}
                                    onValidated={setisPassportConfValid}
                                    shouldBeEqualTo={password}
                                    shouldBeEqualErrorMessage={t('Passwords does not match')}
                                />
                            </div>

                            <div className={'info-well warning-well'} style={{ padding: 12, margin: 0, marginBottom: 30, marginTop: 10, textAlign: 'left' }}>
                                <p style={{ fontWeight: 400, margin: 0, fontSize: 17 }}>1. <Trans>Withdrawals will be locked for 48 hours</Trans></p>
                                <p style={{ fontWeight: 400, margin: 0, fontSize: 17 }}>2. <Trans>All sessions except this will be terminated</Trans></p>
                            </div>
                            <BFGradientButton
                                buttonType={BFGradientButtonType.Destructive}
                                isLoading={isLoading}
                                twoStepOverlayDiv={divRef!}
                                isDisabled={(!isoldPasswordValid || !isPassportValid || !isPassportConfValid)}
                                requireTwoStep={true}
                                // verificationAction={GuardActionType.ChangePassword}
                                // changePasswordRequestData={{ oldPassword: oldPassword!, newPassword: password! }}
                                width={isMobile ? '100%' : 260}
                                text={'CHANGE PASSWORD'}
                                onActionConfirmationCancel={onCancel}
                                onPress={() => {
                                    BitflexOpenApi.SignApi.apiVversionSignSetnewpasswordPost('1.0', "", { oldPassword: oldPassword!, newPassword: password! })
                                        .then(response => {
                                            console.log(response.data)
                                            if (response.data.success) {
                                                BFNotifictionRef.current?.Notify(t('Success'), t('Password Changed!'), BFNotificationType.Success);
                                                setisSuccessChanged(true)
                                            }
                                            else
                                                BFNotifictionRef.current?.Notify(t('Error'), t('Password Change Error. Wrong Password?'), BFNotificationType.Error);
                                        })
                                        .catch(console.log)
                                        .finally(() => {
                                            setisLoading(false)
                                        })
                                }}
                            />
                        </>
                    }
                </div>
            </BFModalWindow>
        </>
    );
}