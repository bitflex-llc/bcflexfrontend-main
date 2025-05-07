import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { BFText, BFTextType } from './affiliate';
import { useRef, useState } from 'react';

import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import useUserState from '../../hooks/useUserState';

export default function Support() {
    const [email, setEmail] = useState(localStorage.getItem('obfuscatedEmail'));
    const [telegram, settelegram] = useState<string>();
    const [shortProblemText, setshortProblemText] = useState<string>();
    const [longProblemText, setlongProblemText] = useState<string>();

    const [isLoading, setisLoading] = useState(false);

    const { isSignedIn } = useUserState();

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const { t } = useTranslation();

    const SubmitSupportTicket = () => {
        setisLoading(true)
        email && BitflexOpenApi.UserApi.apiUserSupportPost({ email, shortText: shortProblemText!, longText: longProblemText!, telegram: telegram })
            .then(() => {
                BFNotifictionRef.current?.Notify(t('Success'), t('Support request successfully sent'), BFNotificationType.Success);

                !isSignedIn && setEmail(null)
                settelegram('')
                setshortProblemText('')
                setlongProblemText('')
            })
            .catch(() => {
                BFNotifictionRef.current?.Notify(t('Error'), t('Error creating support request. Try again later'), BFNotificationType.Error);
            })
            .finally(() => setisLoading(false))
    }

    return (
        <StaticPagesLayout article={ArticleType.Privacy} isDashboard={false} isFullScreen={true}>
            <BFNotification ref={BFNotifictionRef} />
            <div style={{ padding: isMobile ? 12 : 30 }}>
                <BFText textType={BFTextType.Title}>New Ticket</BFText>
                <fieldset className="scheduler-border" style={{ margin: 10 }}>
                    <div style={{ padding: 5 }} />
                    <BFText textType={BFTextType.Text}>
                        Plase provide all intormation about your problem. Our agents usually respond in 12 hours, median - 3 hours.
                    </BFText>
                    <div style={{ padding: 10 }} />
                    <legend className="scheduler-border">Support Request Form</legend>
                    <BFInput type={BFInputType.Email} onValue={setEmail} labelText={'Email'} isDisabled={isSignedIn} isForceShowDisabledValue setValue={email ? email : ''} />
                    <BFInput type={BFInputType.Text} onValue={settelegram} labelText={'Telegram Username'} />
                    <BFInput type={BFInputType.Text} onValue={setshortProblemText} labelText={'Short problem description'} placeholder={'Sign In problem'} />
                    <BFInput type={BFInputType.MultiLineText} onValue={setlongProblemText} labelText={'Long problem description'} />
                    <BFGradientButton buttonType={BFGradientButtonType.Action} isDisabled={!email || !shortProblemText || !longProblemText} isLoading={isLoading} text={t('SUBMIT')} onPress={SubmitSupportTicket} />
                </fieldset>
            </div>
        </StaticPagesLayout>
    );
}
