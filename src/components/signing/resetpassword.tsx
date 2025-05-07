import '../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useRef } from 'react';

import BitflexLogo from '../../images/bitflex-logo.svg';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { PostResetPasswordRequest } from '../../api-wrapper';
import { isMobile } from 'react-device-detect';
import { useState } from 'react';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
    let query = useQuery();

    let userId = query.get('userId');
    let code = query.get('code');

    const history = useNavigate();

    const [password, setPassword] = useState<string>();
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>();

    const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
    const [isPasswordConfrimationValid, setisPasswordConfrimationValid] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const onSubmit = useCallback(() => {

        setIsLoading(true)

        var resetPasswordRequest: PostResetPasswordRequest = {
            userId: userId!,
            password: password!,
            code: code!
        }

        BitflexOpenApi.SignApi.apiVversionSignResetpasswordPost("1.0",resetPasswordRequest)
            .then(response => {
                if (response.data.success) {
                    BFNotifictionRef.current?.Notify(t('Error'), t('Password Changed!'), BFNotificationType.Success)
                    setTimeout(() => {
                        history("/signin");
                        window.location.href = "/signin"
                    }, 1500);
                } else {
                    BFNotifictionRef.current?.Notify(t('Error'), t("Password Change error. Wrong data"), BFNotificationType.Error)
                }
            })
            .finally(() => setIsLoading(false))
            .catch((e) => BFNotifictionRef.current?.Notify(t('Error'), e?.message || "Unspecified error", BFNotificationType.Error))
    }, [code, history, password, t, userId]);

    return (
        <div className="body-login login" id="maindiv">

            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                </Link>
            </div>
            <div className="content" style={{ position: 'relative' }}>
                <BFNotification ref={BFNotifictionRef} />
                <h3 className="form-title"><Trans>Password Restore</Trans></h3>
                <div className="form-group">
                    <label className="control-label"><Trans>New Password</Trans></label>
                    <BFInput type={BFInputType.Password} onValue={setPassword} placeholder={t("New Password")} onValidated={setIsPasswordValid} />
                </div>
                <div className="form-group">
                    <label className="control-label">Confirmation</label>

                    <BFInput type={BFInputType.Password} onValue={setPasswordConfirmation} placeholder={t("Once again new Password")} onValidated={setisPasswordConfrimationValid}
                        shouldBeEqualTo={password} shouldBeEqualErrorMessage={t('Passwords does not match')} />
                </div>
                <div className="form-group">
                    <BFGradientButton
                        isDisabled={(isLoading || !isPasswordValid || !isPasswordConfrimationValid || password?.length === 0 || passwordConfirmation?.length === 0)}
                        isLoading={isLoading}
                        buttonType={BFGradientButtonType.Action} text={t('Submit')} onPress={onSubmit} />
                </div>
            </div>
        </div>
    );
}