import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';

import { FaUser } from 'react-icons/fa';
import { NavMenu } from '../NavMenu';
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { isMobile } from 'react-device-detect';

export enum BFTextType {
    Title,
    SmallTitle,
    Text,

    Cursive
}

export const BFText = ({
    textType,
    children
}: {
    textType: BFTextType,
    children
}): JSX.Element => {
    switch (textType) {
        case BFTextType.Text:
            return <div style={{ fontSize: 17, marginBottom: 10, opacity: 0.8 }}>{children}</div>

        case BFTextType.Title:
            return <div style={{ fontSize: 24, marginBottom: 18, color: 'white' }} className={'font-roboto-condensed'}>{children}</div>

        case BFTextType.SmallTitle:
            return <div style={{ fontSize: 21, marginBottom: 14, color: 'white', marginTop: 10, paddingLeft: 10 }} className={'font-roboto-condensed'}>{children}</div>

        case BFTextType.Cursive:
            return <div style={{ fontSize: 19, marginBottom: 18, color: 'white', fontStyle: "italic" }} className={'font-roboto-condensed'}>{children}</div>
    }
}

export const BFListItem = ({ children }: { children }): JSX.Element => {
    return <li style={{ fontSize: 17, color: 'white', padding: 3 }}>{children}</li>
}

export default function Affiliate() {

    return (

        <StaticPagesLayout article={ArticleType.Affiliate} isDashboard={false}>
            {/* <div className={'bf-dash-header'} style={{ paddingTop: 10, textAlign: 'center' }}>
                <h1 className={'bf-dashboard-title'}>Affiliate Program</h1>
            </div> */}



            {/* 
            <BFText textType={BFTextType.Title}></BFText>

            <BFText textType={BFTextType.Text}></BFText>


            <BFText textType={BFTextType.Title}></BFText>

            <BFText textType={BFTextType.Text}></BFText> */}

            <div style={{ padding: isMobile ? 12 : 30 }}>
                <BFText textType={BFTextType.Title}>Affiliate Program</BFText>
                <BFText textType={BFTextType.Text}>Tell your partners about cryptocurrency, monetize your traffic, and earn every time they buy cryptocurrency. You can earn special rewards and get lucrative commissions on every trade, across BCFLEX.</BFText>

                <div style={{ padding: 20 }}></div>

                <BFText textType={BFTextType.Title}>How Does it Work?</BFText>
                <BFText textType={BFTextType.Text}>When you share information about BCFLEX and recommend our platform to your friends, you earn a commission in crypto. To become part of the affiliate program, you need:</BFText>

                <BFListItem>
                    Sign up and verify your account
                </BFListItem>
                <BFListItem>
                    Create and share your affiliate link to earn up to 40% commissions.
                </BFListItem>
                <BFListItem>
                    Create, manage, and track your affiliate links from your BCFLEX account.
                </BFListItem>
                <BFListItem>
                    Receive a commission on every trade the user will make after creating an account with your affiliate link.
                </BFListItem>

                <div style={{ padding: 20 }}></div>

                <BFText textType={BFTextType.Title}>Fee distribution</BFText>
                <BFText textType={BFTextType.Text}>Our affiliate program allows you to earn money by attracting clients/investors. We give 40% of commissions to people in the referral program. We divide this 40% into five levels. You can invite an unlimited number of participants. The more referrals are registered via the link, the more income will be.</BFText>

                <div style={{ padding: 20 }}></div>

                <div style={{ display: isMobile ? 'unset' : 'flex', flexDirection: isMobile ? 'unset' : 'row' }}>
                    <div>
                        <BFText textType={BFTextType.SmallTitle}>Affiliate Level 1</BFText>
                        <BFText textType={BFTextType.Text}>Under the terms of the affiliate program, BCFLEX referrals receive, at the first level, 50% of the commission for every deal the partner has made.</BFText>

                        <BFText textType={BFTextType.SmallTitle}>Affiliate Level 2</BFText>
                        <BFText textType={BFTextType.Text}>The base referral rate of the second level of the affiliate program is 25% from fees.</BFText>

                        <BFText textType={BFTextType.SmallTitle}>Affiliate Level 3</BFText>
                        <BFText textType={BFTextType.Text}>At the third level, you will receive 12.5% of the income from the commissions of transactions of each user of this level.</BFText>

                        <BFText textType={BFTextType.SmallTitle}>Affiliate Level 4</BFText>
                        <BFText textType={BFTextType.Text}>The expected income from our affiliate program at the fourth level will be 7.5% from fees.</BFText>

                        <BFText textType={BFTextType.SmallTitle}>Affiliate Level 5</BFText>
                        <BFText textType={BFTextType.Text}>The maximum percentage of income at this level will be 5%</BFText>
                    </div>

                    <div style={{ display: 'flex', height: '500' }}>
                        <div style={{ height: 400, width: 90, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'center' }}>
                            <p className={'affiliate-level'}>Level 1</p>
                            <p className={'affiliate-level'}>Level 2</p>
                            <p className={'affiliate-level'}>Level 3</p>
                            <p className={'affiliate-level'}>Level 4</p>
                            <p className={'affiliate-level'}>Level 5</p>
                        </div>
                        <div className={'affiliate-background'} style={{ height: 400, width: 90, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'center' }}>
                            <div style={{ margin: '20px 0' }}><FaUser /></div>
                            <div style={{ margin: '20px 0' }}><FaUser /><FaUser /></div>
                            <div style={{ margin: '20px 0' }}><FaUser /><FaUser /><FaUser /></div>
                            <div style={{ margin: '20px 0' }}><FaUser /><FaUser /><FaUser /><FaUser /></div>
                            <div style={{ margin: '20px 0' }}><FaUser /><FaUser /><FaUser /><FaUser /><FaUser /></div>
                        </div>
                        <div style={{ height: 400, width: 200, display: 'flex', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'left' }}>
                            <div className={'affiliate-descr'}>
                                <span>50% from fees</span>
                                <strong>Affiliate Level 1</strong>
                            </div>
                            <div className={'affiliate-descr'}>
                                <span>25% from fees</span>
                                <strong>Affiliate Level 2</strong>
                            </div>
                            <div className={'affiliate-descr'}>
                                <span>12.5% from fees</span>
                                <strong>Affiliate Level 3</strong>
                            </div>
                            <div className={'affiliate-descr'}>
                                <span>7.5% from fees</span>
                                <strong>Affiliate Level 4</strong>
                            </div>
                            <div className={'affiliate-descr'}>
                                <span>5% from fees</span>
                                <strong>Affiliate Level 5</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: 20 }}></div>

                <BFText textType={BFTextType.Cursive}>
                    For example: the volume of trades is $100,000, the commission of our service is 0.1% = $100. Accordingly, referrals will get $20 at level one, $10 at level two, $5 at level three, $3 at level four, and $2 at level five for each partner. If at the first level you have 3 referrals, then your income will be $60.
                </BFText>


            </div>
        </StaticPagesLayout>


    );
}
