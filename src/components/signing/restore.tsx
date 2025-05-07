import '../../css/signlayout.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import React, { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BitflexLogo from '../../images/bitflex-logo.svg';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { Link } from 'react-router-dom';
import { PostForgotPasswordRequest } from '../../api-wrapper/api';
import { isMobile } from 'react-device-detect';
import { useCallback } from 'react';

export default function Restore() {

    const [isLoading, setisLoading] = useState(false);

    const [email, setemail] = useState<string>();
    const [isValidEmail, setisValidEmail] = useState();

    const [submitted, setsubmitted] = useState(false);

    const { t } = useTranslation();


    let BFNotifictionRef = useRef<IBFNotification>(null);

    const onSubmit = useCallback(() => {

        setisLoading(true)

        var restoreRequest: PostForgotPasswordRequest = {
            email: email!
        }

        BitflexOpenApi.SignApi.apiVversionSignRestorepasswordPost("1.0",restoreRequest).then(result => {
            if (result.data.success) setsubmitted(true)
            else BFNotifictionRef.current?.Notify(t('Error'), t('Error is password restoration. Wrong email?'), BFNotificationType.Error)
        })
            .finally(() => setisLoading(false))
    }, [email, t])

    return (
        <div className="body-login login" id="maindiv">
            <div className="logo">
                <Link className="logo" to={'/terminal'}>
                <img src={BitflexLogo} alt="" width={isMobile ? '80%' : 350} />
                </Link>
            </div>
            <div className="content" style={{minHeight: 200}}>
                <BFNotification ref={BFNotifictionRef} />
                <h3 className="form-title"><Trans>Password Restore</Trans></h3>

                {!submitted ?
                    <>

                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <BFInput type={BFInputType.Email} onValue={setemail} placeholder="Joseph.A.Cooper@gmail.com" onValidated={setisValidEmail} />
                            {/* <input className='input-form' type="email" placeholder="Joseph.A.Cooper@gmail.com" name="email" ref={register({ required: true, pattern: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i })} /> */}
                        </div>
                        <div className="form-group">
                            <BFGradientButton isDisabled={(isLoading || !isValidEmail || email?.length === 0)} isLoading={isLoading} buttonType={BFGradientButtonType.Action} text={t('Submit')} onPress={onSubmit} />
                        </div>

                    </>
                    :
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <p style={{ fontSize: 17 }}><Trans>We have sent you an email with instructions.</Trans></p>
                        <br />
                        <Link to="/signin" style={{ color: '#cf8900' }}><Trans>Back to Sign In</Trans></Link>
                    </div>
                }
            </div>
        </div>
    );
}

