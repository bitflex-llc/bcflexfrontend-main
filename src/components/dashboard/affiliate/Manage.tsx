import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../html/BFNotification';
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    LivejournalIcon,
    LivejournalShareButton,
    MailruIcon,
    MailruShareButton,
    OKIcon,
    OKShareButton,
    PinterestIcon,
    PinterestShareButton,
    RedditIcon,
    RedditShareButton,
    TelegramIcon,
    TelegramShareButton,
    TumblrIcon,
    TumblrShareButton,
    TwitterIcon,
    TwitterShareButton,
    VKIcon,
    VKShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from 'react-share';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BFModalWindow } from '../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import { FaCopy } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import exampleImage from '../../../images/bitflex-logo.svg';
import { isMobile } from 'react-device-detect';
import presentImage from '../../../images/NicePng_presente-png_4080171.png'
import qr from '../../../images/qr-code.png'
import { useCallback } from 'react';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function Manage() {
    // const {
    //     state: { currencies },
    //     dispatch
    // } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(true);
    const [refId, setrefId] = useState<string>();

    const [isShareModalOpen, setisShareModalOpen] = useState(false);

    let BFNotifictionRef = useRef<IBFNotification>(null);

    let BFNotifictionRefHero = useRef<IBFNotification>(null);

    const shareUrl = "https://bcflex.com/r/" + refId;
    const title = 'BCFLEX - Cryptocurrency Exchange';

    const { t } = useTranslation();

    useEffect(() => {

        BitflexOpenApi.UserApi.apiVversionUserAffiliateGet("1.0")
            .then(response => {
                if (response.data.refId)
                    setrefId(response.data.refId)
            })
            .finally(() => setisLoading(false))
    }, []);



    const StyledRow = ({ children }: { children }) => {
        return <div style={{
            background: Colors.BITFLEXBackground,
            padding: 12,
            margin: 12,
            marginTop: 0,
            borderRadius: 5,
            display: 'flex',
            flexDirection: 'row',

        }} >
            {children}
        </div>
    }

    const BannerAndText = () => {



        return (
            <div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 1350, margin: '0px auto' }}>
                    <div style={{ width: '100%' }}>
                        <div style={{ margin: 25 }}>
                            <p style={{ fontSize: 22 }}>Earn up to 40% comission on every friend's trade. Up to five levels depth.</p>
                            <NavLink style={{ color: Colors.bitFlexGoldenColor, fontSize: 18 }} to={'/affiliate'}>How does it work?</NavLink>
                        </div>
                    </div>


                    <div style={{ margin: 7 }}>


                        <div style={{ background: Colors.bitFlexPortletColor, borderRadius: 5, minHeight: 300, borderWidth: 1, borderStyle: 'solid', borderColor: Colors.BITFLEXBorder, position: 'relative', overflow: 'hidden' }}>
                            <BFNotification ref={BFNotifictionRefHero} />
                            <div style={{ padding: 12, fontSize: 17 }}>Referral Settings</div>

                            <StyledRow>
                                <div style={{ width: '50%' }}>
                                    <span style={{ fontSize: 14 }}>You Receive</span>
                                    <br />
                                    <span style={{ fontSize: 24, color: Colors.bitflexGolderColor2 }} className={'font-roboto-condensed'}>20%</span>
                                </div>
                                <div style={{ width: '50%' }}>
                                    <span style={{ fontSize: 24 }}>Want <span style={{ color: Colors.bitflexGolderColor2 }} className={'font-roboto-condensed'}>40%</span>?</span>
                                    <br />
                                    <span>Keep more than <span style={{ color: Colors.bitFlexGoldenColor }} className={'font-roboto-condensed'}>500</span> <span style={{ color: Colors.bitFlexGoldenColor }}>BTFX</span></span>
                                </div>

                            </StyledRow>


                            <StyledRow>
                                <div style={{ width: '50%' }}>

                                    <span style={{ fontSize: 18 }}>Referral Link</span>
                                </div>
                                <div style={{ width: '50%' }}>
                                    <span style={{ fontSize: 18 }}>{toShort("https://bcflex.com/r/" + refId, 3)}</span>

                                </div>
                            </StyledRow>

                            <div style={{ padding: 12 }}>
                                <BFGradientButton
                                    buttonType={BFGradientButtonType.GoldenBorder}
                                    text={'Copy Affiliate Link'}
                                    width={'100%'}
                                    onPress={() => {
                                        navigator.clipboard.writeText("https://bcflex.com/r/" + refId)
                                        BFNotifictionRefHero.current?.Notify(t('Success'), t('Referral Link copied'), BFNotificationType.Success);
                                    }}
                                />
                            </div>


                            <div style={{ padding: 12, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <div style={{ width: isMobile ? '100%' : '92%' }}>
                                    <BFGradientButton
                                        buttonType={BFGradientButtonType.GreenBorder}
                                        text={'Invite Friends'}
                                        width={'100%'}
                                        image={<img src={presentImage} width={48} />}
                                        onPress={() => setisShareModalOpen(true)}

                                    />
                                </div>
                                {isMobile === false && <div style={{}}>
                                    <img src={qr} width={43} />
                                </div>}
                            </div>


                        </div>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <>

            <BFModalWindow isOpen={isShareModalOpen} title={'Invite Friends'} onClose={() => setisShareModalOpen(false)}>
                <div className="Demo__container">
                    <div className="Demo__some-network">
                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}
                            className="Demo__some-network__share-button"
                        >
                            <FacebookIcon size={55} round />
                        </FacebookShareButton>
                    </div>


                    <div className="Demo__some-network">
                        <TwitterShareButton
                            url={shareUrl}
                            title={title}
                            className="Demo__some-network__share-button"
                        >
                            <TwitterIcon size={55} round />
                        </TwitterShareButton>


                    </div>

                    <div className="Demo__some-network">
                        <TelegramShareButton
                            url={shareUrl}
                            title={title}
                            className="Demo__some-network__share-button"
                        >
                            <TelegramIcon size={55} round />
                        </TelegramShareButton>


                    </div>

                    <div className="Demo__some-network">
                        <WhatsappShareButton
                            url={shareUrl}
                            title={title}
                            separator=":: "
                            className="Demo__some-network__share-button"
                        >
                            <WhatsappIcon size={55} round />
                        </WhatsappShareButton>


                    </div>

                    <div className="Demo__some-network">
                        <LinkedinShareButton url={shareUrl} className="Demo__some-network__share-button">
                            <LinkedinIcon size={55} round />
                        </LinkedinShareButton>
                    </div>

                    <div className="Demo__some-network">
                        <PinterestShareButton
                            url={String(window.location)}
                            media={`${String(window.location)}/${exampleImage}`}
                            className="Demo__some-network__share-button"
                        >
                            <PinterestIcon size={55} round />
                        </PinterestShareButton>
                    </div>

                    <div className="Demo__some-network">
                        <VKShareButton
                            url={shareUrl}
                            image={`${String(window.location)}/${exampleImage}`}
                            className="Demo__some-network__share-button"
                        >
                            <VKIcon size={55} round />
                        </VKShareButton>
                    </div>

                    <div className="Demo__some-network">
                        <OKShareButton
                            url={shareUrl}
                            image={`${String(window.location)}/${exampleImage}`}
                            className="Demo__some-network__share-button"
                        >
                            <OKIcon size={55} round />
                        </OKShareButton>

                    </div>

                    <div className="Demo__some-network">
                        <RedditShareButton
                            url={shareUrl}
                            title={title}
                            windowWidth={660}
                            windowHeight={460}
                            className="Demo__some-network__share-button"
                        >
                            <RedditIcon size={55} round />
                        </RedditShareButton>

                    </div>

                    <div className="Demo__some-network">
                        <TumblrShareButton
                            url={shareUrl}
                            title={title}
                            className="Demo__some-network__share-button"
                        >
                            <TumblrIcon size={55} round />
                        </TumblrShareButton>
                    </div>

                    <div className="Demo__some-network">
                        <LivejournalShareButton
                            url={shareUrl}
                            title={title}
                            description={shareUrl}
                            className="Demo__some-network__share-button"
                        >
                            <LivejournalIcon size={55} round />
                        </LivejournalShareButton>
                    </div>

                    <div className="Demo__some-network">
                        <MailruShareButton
                            url={shareUrl}
                            title={title}
                            className="Demo__some-network__share-button"
                        >
                            <MailruIcon size={55} round />
                        </MailruShareButton>
                    </div>





                </div>
            </BFModalWindow>

            <StaticPagesLayout isDashboard={true} isLoading={isLoading} isFullScreen={true} bannerElement={<BannerAndText />}>
                <>
                    <BFNotification ref={BFNotifictionRef} />

                    <h2 className={'bf-dashboard-title'} style={{ textAlign: 'left', fontSize: 24 }}><Trans>Dashboard</Trans></h2>

                    <StyledRow>
                        <div style={{ width: '70%' }}>

                            <span style={{ fontSize: 18 }}>Your Affiliate Earnings</span>
                        </div>
                        <div style={{ width: '30%' }}>
                            <span style={{ fontSize: 18 }}>0 USD</span>
                        </div>
                    </StyledRow>

                    <StyledRow>
                        <div style={{ width: '70%' }}>

                            <span style={{ fontSize: 18 }}>Affiliates that traded</span>
                        </div>
                        <div style={{ width: '30%' }}>
                            <span style={{ fontSize: 18 }}>0</span>
                        </div>
                    </StyledRow>

                    <StyledRow>
                        <div style={{ width: '70%' }}>

                            <span style={{ fontSize: 18 }}>Total Affiliates</span>
                        </div>
                        <div style={{ width: '30%' }}>
                            <span style={{ fontSize: 18 }}>0</span>
                        </div>
                    </StyledRow>



                </>
            </StaticPagesLayout>
        </>
    );
}

const styles: StylesDictionary = {
    emptyList: {
        padding: 40,
        width: isMobile ? 'unset' : '50%', backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto', marginTop: '10%',
        textAlign: 'center',
        // top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'absolute'

    }
}


export const toShort = (value: string, factor: number = 5) => {
    const slice = Math.round(value.length / factor)
    return `${value.substr(0, slice)}...${value.substr(value.length - slice, value.length)}`
}