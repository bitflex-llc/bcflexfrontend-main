import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';
import { BFText, BFTextType } from './affiliate';

import { NavLink } from 'react-router-dom';
import { NavMenu } from '../NavMenu';
import React from 'react';
import { isMobile } from 'react-device-detect';

export default function Terms() {
    return (
        <StaticPagesLayout article={ArticleType.Privacy} isDashboard={false}>
            {/* <NavMenu activeIndexIn={4} /> */}

            <div style={{ padding: isMobile ? 12 : 30 }}>


                {/* <BFText textType={BFTextType.Cursive}>

                    Please read these Terms of Use and all the documents under the navigation tab of “References” carefully.
                    By clicking the “Sign Up” button or by accessing or using any service made available by us,
                    you agree to be legally bound by these Terms of Use (including the Fees, all the documents
                    under the navigation tab of “References” and Contract Guide), the Privacy Policy
                    and all terms incorporated by reference in the foregoing.
                    Meanwhile, you hereby agree and confirm that in order to facilitate your use of B
                    ITFLEX Exchange and other related services, you hereby authorize BCFLEX Exchange to obtain from
                   BCFLEX Platform the information you provided and formed during the registration
                    and use of the relevant services on BCFLEX Platform, including but not limited to
                    your registered account information on BCFLEX Platform, information provided
                    under the anti-money laundering, countering the financing of terrorism and
                    know your customer compliance policy (the “AML/CFT Policy”), and any other
                    information that you agreed to provide to the platform under the Term of Use of the BCFLEX Platform.
                </BFText> */}
                {/* 

                <BFText textType={BFTextType.Title}></BFText>
                <BFText textType={BFTextType.Text}></BFText> */}
                {/* 


                <BFText textType={BFTextType.Cursive}>

                   BCFLEX Exchange attaches great importance to the protection of user's
                    personal information (that is, information that can identify the user's
                    identity independently or in combination with other information). When
                    you use BCFLEX Exchange Services, you agree that BCFLEX Exchange can
                    collect, store, process, disclose and protect your personal information
                    in accordance with the Privacy Policy published on BCFLEX Exchange.
                   BCFLEX Exchange hopes to give you a clear introduction of how BCFLEX
                    Exchange processes your personal information through our Privacy Policy.
                    Therefore, BCFLEX Exchange recommends that you read the Privacy Policy
                    completely (<NavLink to={'/privacy'}>https://bcflex.com/privacy</NavLink>)
                    in order to help you better protect your privacy.

                </BFText> */}

                <BFText textType={BFTextType.Title}>Summary of Terms of Use</BFText>

                <BFText textType={BFTextType.Text}>
                    We, BCFLEX Exchange (hereinafter referred to as “ BCFLEX Exchange”,
                    “we” or “us”), summarize below our Terms of Use to give an overview of
                    the key terms that apply to your use of our website and trading
                    services.While we hope this summary section is helpful, you must read
                    the complete Terms of Use below since they provide important information
                    about our services, our respective legal rights and obligations, and the
                    risks involved in trading different derivatives contracts with various
                    cryptocurrencies as the underlying (“Products”).
                </BFText>

                <BFText textType={BFTextType.Title}>Our Services</BFText>


                <BFText textType={BFTextType.Text}>
                   BCFLEX Exchange is an online trading platform which provides you a
                    simple and convenient way to trade the Products.The Products offered on
                    the Platform include a range of different derivatives contracts with
                    various cryptocurrencies as the underlying.All transactions and
                    settlement of the Products, and calculations of your profits or losses
                    on any of the Products, shall be in Bitcoin only and not any fiat
                    currency or any other cryptocurrency or altcoin, notwithstanding that
                    the Products may relate to or be derivatives on such other
                    cryptocurrencies or altcoins.
                </BFText>

                <BFText textType={BFTextType.Title}>Eligibility and Acceptable Use</BFText>


                <BFText textType={BFTextType.Text}>
                    You must meet certain eligibility criteria to use BCFLEX Exchange’s
                    services.You must be at least 18 years of age and there are certain
                    locations from which you may not be able to use some or all of BCFLEX
                    Exchange’s services.Other eligibility criteria may also apply.
                    Additionally, there are certain things you cannot do when using BCFLEX
                    Exchange’s services, such as engage in market misconduct or illegal
                    activities, lie, or do anything that would cause damage to our services
                    or systems.Please see Section 12 below on “Acceptable Use” for more
                    details.
                </BFText>

                <BFText textType={BFTextType.Title}>Trading Risks</BFText>

                <BFText textType={BFTextType.Text}>
                    Engaging in Products trades may be highly risky.Please do not use
                   BCFLEX Exchange’s services if you do not understand these risks.
                </BFText>

                <BFText textType={BFTextType.Title}>
                    Other Important Legal Terms
                </BFText>

                <BFText textType={BFTextType.Text}>
                    There are important legal terms provided below in the complete Terms of
                    Use, including your indemnification responsibilities, our limitation of
                    liability and warranty disclaimers, and your agreement to arbitrate
                    disputes.Please take the time to read these terms carefully.You can
                    always contact us through BCFLEX Exchange Help Center if you have any
                    questions.
                </BFText>

                <BFText textType={BFTextType.Title}>
                    Complete Terms of Use
                </BFText>

                <BFText textType={BFTextType.Text}>
                    These Terms of Use and any terms expressly incorporated herein
                    (including but not limited to all the documents under the navigation tab
                    of “References” and Risk Disclosure Statement, “Terms”) apply to your
                    use of the website operated and maintained by BCFLEX Exchange
                    (collectively, “ BCFLEX Exchange”, “we”, or “us”), and the trading
                    services provided by BCFLEX Exchange as described in these Terms
                    (collectively, our “Services”).
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    1. Key Definitions
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Capitalized terms not otherwise defined in these Terms will have the
                    following meaning:
                </BFText>

                <BFText textType={BFTextType.Text}>
                    1.1 “External Account” means any account: (i) from which you may
                    transfer Bitcoins into your BCFLEX Exchange Account, and (ii) to which
                    you may transfer Bitcoins from your BCFLEX Exchange Account and which
                    has been approved by BCFLEX Exchange for the foregoing purposes.
                </BFText>



                <BFText textType={BFTextType.Text}>
                    1.2.“Funds” means the Bitcoin assets BCFLEX Exchange users transfer to
                    or from its BCFLEX Exchange Account.
                </BFText>
                <BFText textType={BFTextType.Text}>
                    1.3.“ BCFLEX Exchange Account” means a user account accessible via the
                    Services where Bitcoins may be stored by BCFLEX Exchange on behalf of a
                    user.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    1.4.“ BCFLEX Exchange Help Center” means BCFLEX Exchange’s customer
                    service center with address at <a href="https://support.bcflex.com" target='_blank'>https://support.bcflex.com</a>
                    where you could get online support from BCFLEX Exchange.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    1.5.“Products” means the derivatives contracts with various
                    cryptocurrencies as the underlying, which are traded on BCFLEX
                    Exchange, including but not limited to Perpetual Contracts which are
                    detailed in all the documents under the navigation tab of “References”
                    and BCFLEX Exchange Contract Guides.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>2. Eligibility </BFText>

                <BFText textType={BFTextType.Text}>
                    2.1. BCFLEX Exchange may not make the Services available in all markets
                    and jurisdictions, and may restrict or prohibit the use of the Services
                    from certain jurisdictions (“Restricted Locations”).
                </BFText>

                <BFText textType={BFTextType.Text}>
                    2.2.You further represent and warrant that you: (a) are at least 18
                    years old; (b) have not previously been suspended or removed from using
                    our Services or other similar services provided by other parties; (c)
                    have full power and authority to enter into these Terms and in doing so
                    will not violate any other agreement to which you are a party; (d) using
                    our platform in your own name and solely for your own benefit; (e) are
                    not located in, under the jurisdiction of, or a national or resident of
                    any Restricted Locations (as defined in Section 2.1 above); (f) will not
                    use our Services if any applicable laws in your country prohibit you
                    from doing so in accordance with these Terms; (g) are not a designated
                    person under regulations issued pursuant to the lists of individuals or
                    entities identified by the Security Council of the United Nations or the
                    Committee as individuals or entities to whom or which apply the measures
                    referred to in paragraph 8(d) of Resolution 1718 (2006)(including any
                    such list as updated from time to time by the Security Council or the
                    Committee, and made available on the Internet through the official
                    United Nations website at http://www.un.org/) ; and (h) have read and
                    understood these Terms and the Risk Disclosure Statement.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    2.3. BCFLEX Exchange maintains an anti-money laundering, countering the
                    financing of terrorism and know your customer compliance policy (the
                    “AML/CFT Policy”).Pursuant to such policy, BCFLEX Exchange may, in its
                    discretion, require identity verification and go through other screening
                    procedures with respect to you or transactions associated with your
                   BCFLEX Exchange Account.You agree and undertake to provide BCFLEX
                    Exchange with any and all information and documents that BCFLEX
                    Exchange may from time to time request or require for the purposes of
                    these Terms or in connection with your BCFLEX Exchange Account
                    (including, but not limited to, your name, address, telephone number,
                    email address, date of birth, government-issued identification number,
                    photograph of your government-issued identity card or document or other
                    photographic proof of your identity, and information regarding your
                    Account). BCFLEX Exchange will have no liability or responsibility for
                    any permanent or temporary inability to access or use any Services as a
                    result of any identity verification or other screening procedures.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Further, pursuant to the AML/CFT Policy, BCFLEX Exchange may, in its
                    discretion, carry out continuous monitoring of all BCFLEX Exchange
                    Accounts.If an unusually large or unusual patterns of trades or any
                    inexplicable or suspicious circumstances are observed, BCFLEX Exchange
                    may, in its discretion, place an administrative hold on or freeze your
                   BCFLEX Exchange Account.You agree that BCFLEX Exchange will have no
                    liability or responsibility for any permanent or temporary inability to
                    access or use any Service caused by such action.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    2.4.Additionally, by agreeing to these terms you certify that you
                    pursue participation in blockchain-based networks as a part of your
                    professional activity and are familiar with the Products and the risks
                    attached to them and their trading, including but not limited to the
                    risks highlighted in the Risk Disclosure Statement.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    3. BCFLEX Exchange Account
                </BFText>

                <BFText textType={BFTextType.Text}>
                    3.1.Number of BCFLEX Exchange Accounts. BCFLEX Exchange may, in its
                    sole discretion, limit the number of BCFLEX Exchange Accounts that you
                    may hold, maintain or acquire.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    3.2. BCFLEX Exchange Account information and security.In order to
                    engage in any trades via the Services, you must create a BCFLEX
                    Exchange Account and provide any requested information.When you create
                    a BCFLEX Exchange Account, you agree to take responsibility for all
                    activities that occur under your BCFLEX Exchange Account and accept all
                    risks of any authorized or unauthorized access to your BCFLEX Exchange
                    Account, to the maximum extent permitted by law.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    3.3.You are solely responsible for doing all things and taking all
                    actions necessary to monitor and secure your BCFLEX Exchange Account,
                    and to enable or receive financial or other benefits made available to
                    account holders.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    3.4.You must not create security or any other collateral interest over
                    the funds in your BCFLEX Exchange Account except with our prior written
                    consent.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    4. Privacy Policy
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Please refer to our <NavLink to={'/privacy'}>https://bcflex.com/privacy</NavLink> for information about how we collect, use and disclose your personal data.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    5. General Obligations
                </BFText>

                <BFText textType={BFTextType.Text}>
                    This Section 5 applies to (i) all trades completed via the Services, and
                    (ii) any transaction in which you transfer Funds into your BCFLEX
                    Exchange Account from your External Account or transfer Funds from your
                   BCFLEX Exchange Account into an External Account.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    5.1.Conditions and Restrictions.We may, at any time and in our sole
                    discretion, refuse any trade submitted via the Services, impose limits
                    on the trade amount permitted via the Services or impose any other
                    conditions or restrictions upon your use of the Services without prior
                    notice.For example, we may restrict trades from certain locations.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    5.2.Accuracy of Information.You must provide any information required
                    when creating a BCFLEX Exchange Account or when prompted by any screen
                    displayed within the Services.You represent and warrant that any
                    information you provide via the Services is accurate and complete.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    5.3.Insufficient Funds.If you have an insufficient amount of Funds in
                    your BCFLEX Exchange Account to complete an order via the Services, we
                    may cancel the entire order or may fulfill a partial order using the
                    amount of Funds currently available in your BCFLEX Exchange Account,
                    less any fees owed to BCFLEX Exchange in connection with our execution
                    of the trade (as described in Section 9 below).
                </BFText>

                <BFText textType={BFTextType.Text}>
                    5.4.Taxes.It is your responsibility to determine what, if any, taxes
                    apply to the trades you complete via the Services, and it is your
                    responsibility to report and remit the correct tax to the appropriate
                    tax authority.You agree that BCFLEX Exchange is not responsible for
                    determining whether taxes apply to your trades or for collecting,
                    reporting, withholding, or remitting any taxes arising from any trades.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    5.5.Compliance with all applicable laws and regulations.You represent,
                    warrant and undertake that you have and shall at all times comply with
                    all applicable laws and regulations in all jurisdictions relevant to any
                    Service provided or made available by us to you.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    6. BCFLEX Exchange Account Funds
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Ownership of Funds.You hereby represent and warrant that any Funds
                    transferred to your BCFLEX Exchange Account from an External Account or
                    otherwise used by you in connection with the Services are owned by you
                    legally and beneficially, and that all orders, trades and transactions
                    initiated with your BCFLEX Exchange Account are for your own account
                    and not on behalf of any other person or entity.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>7. Trades </BFText>

                <BFText textType={BFTextType.Text}>
                    7.1.Market volatility.Particularly during periods of high volume,
                    illiquidity, fast movement, or volatility in the marketplace for any
                    particular one or more Product, the actual market rate at which a trade
                    is executed may be different from the prevailing rate indicated via the
                    Services at the time of your order or trade.You understand that we are
                    not liable for any such price fluctuations.In the event of a market
                    disruption or Force Majeure event (as defined in Section 22), BCFLEX
                    Exchange may do one or more of the following: (a) suspend access to the
                    Services; or (b) prevent you from completing any actions via the
                    Services, including closing any open positions.Following any such
                    event, when trading resumes, you acknowledge that prevailing market
                    rates may differ significantly from the rates available prior to such an
                    event.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    7.2.Independent Relationship, No Advice.You acknowledge and agree
                    that: (a) BCFLEX Exchange is not holding monies and/or Funds as your
                    trustee, and is not acting as your broker, intermediary, agent, or
                    advisor or in any fiduciary capacity, and (b) no communication or
                    information provided to you by BCFLEX Exchange shall be considered or
                    construed as advice.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    We shall not give advice to you on the merits of any trade and shall
                    deal with you on an execution-only basis.None of our employees or staff
                    are authorized by us to give you investment advice.Accordingly, you
                    should not regard any proposed trades, suggested trading strategies, or
                    other written or oral communications from us as investment
                    recommendations or advice or as expressing our view as to whether a
                    particular trade is suitable for you or meets your financial objectives.
                    You must rely on your own judgment for any investment decision you make
                    in relation to your BCFLEX Exchange Account.If you require investment
                    or tax advice, please contact an independent investment or tax adviser.
                    You acknowledge and agree that you have made your own independent
                    analysis and decision when executing a trade and such trades are entered
                    into without reliance upon any views, representations (whether written
                    or oral), advice, recommendation, information, or other statements by
                    us.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    8. Risk Disclosure
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Please refer to the Risk Disclosure Statement which is available at <NavLink to={'/risks'}>Risks</NavLink>
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>9. Fees </BFText>

                <BFText textType={BFTextType.Text}>
                    9.1.Amount of Fees.You agree to pay the fees for trades completed via
                    our Services (“Fees”) as made available via the Fees, which we may
                    change from time to time.Changes to the Fees are effective as of the
                    effective date indicated in the posting of the revised Fees to the
                    Services, and will apply prospectively to any trades that take place
                    following the effective date of such revised Fees.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    9.2.Third-Party Fees.In addition to the Fees, your External Account
                    may impose fees in connection with your use of your designated External
                    Account via the Services.Any fees imposed by your External Account
                    provider will not be reflected on the transaction screens containing
                    information regarding applicable Fees.You are solely responsible for
                    paying any fees imposed by an External Account provider.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    9.3.Payment of Fees.You authorize us, or our designated payment
                    processor, to charge or deduct your BCFLEX Exchange Account Funds for
                    any applicable Fees owed in connection with trades you complete via the
                    Services.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    10. Electronic Notices
                </BFText>

                <BFText textType={BFTextType.Text}>
                    10.1.Consent to Electronic Delivery.You agree and consent to receive
                    electronically all communications, agreements, documents, receipts,
                    notices, and disclosures (collectively, “Communications”) that BCFLEX
                    Exchange provides in connection with your BCFLEX Exchange Account
                    and/or use of the BCFLEX Exchange Services.You agree that BCFLEX
                    Exchange may provide these Communications to you by posting them via the
                    Services, by emailing them to you at the email address you provide.You
                    should maintain copies of electronic Communications by printing a paper
                    copy or saving an electronic copy.You may also contact us through
                   BCFLEX Exchange Help Center to request additional electronic copies of
                    Communications or, for a fee, paper copies of Communications (as
                    described below).
                </BFText>

                <BFText textType={BFTextType.Text}>
                    10.2.Withdrawal of Consent. You may withdraw your consent to receive
                    electronic Communications by contacting BCFLEX Exchange Help Center.If
                    you decline or withdraw consent to receive electronic Communications,
                   BCFLEX Exchange may suspend or terminate your use of the Services.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    10.3.Updating Contact Information. It is your responsibility to keep
                    your email address on file with BCFLEX Exchange up to date so that
                   BCFLEX Exchange can communicate with you electronically.You understand
                    and agree that if BCFLEX Exchange sends you an electronic Communication
                    but you do not receive it because your email address on file is
                    incorrect, out of date, blocked by your service provider, or you are
                    otherwise unable to receive electronic Communications, BCFLEX Exchange
                    will be deemed to have provided the Communication to you.
                </BFText>


                <BFText textType={BFTextType.SmallTitle}>
                    11. Unclaimed or Disputed Property
                </BFText>

                <BFText textType={BFTextType.Text}>

                    11.1 Notwithstanding the below 11.2 provision, If for any reason
                   BCFLEX is holding Funds in your BCFLEX Account, such Funds remain
                    unclaimed, and BCFLEX is unable to return your Funds to your designated
                    External Account after a period of three years after your last login to
                   BCFLEX or any specified period notified by BCFLEX, and BCFLEX
                    determines in good faith that it is not able to trace you, you agree
                    that all such Funds shall be deemed to have been abandoned by you in
                    favour of BCFLEX and may be appropriated by BCFLEX to and for itself,
                    and you thereafter shall have no right to claim such Funds.
                </BFText>



                <BFText textType={BFTextType.Text}>
                    11.2 In the event that any type of tokens in your BCFLEX Account will
                    be/has been delisted in accordance with the BCFLEX ’s delisting rules
                    updated from time to time (" Event"), BCFLEX is entitled to publish an
                    official announcement on its website to inform you of the Event
                    ("Delisting Announcement") and require you to withdraw such delisting
                    tokens before the deadline (“Deadline”).In the event that you are
                    unable to withdraw such delisting tokens held in your BCFLEX Account
                    before the Deadline, BCFLEX determines in good faith that it is not
                    able to trace you, you agree that all such Funds shall be deemed to have
                    been abandoned by you in favour of BCFLEX and may be appropriated by
                   BCFLEX to and for itself, and you thereafter shall have no right to
                    claim such Funds.For the avoidance of doubts, unless otherwise
                    notified, the definition of the Deadline should be the period of six (6)
                    months from the date of Delisting Announcement.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    <br /> 11.3 If BCFLEX receives notice that any Digital Tokens held in
                    your BCFLEX Account are alleged to have been stolen or otherwise are
                    not lawfully possessed by you, BCFLEX may, but has no obligation to,
                    place an administrative hold on or freeze the affected Digital Tokens or
                    your BCFLEX Account.If BCFLEX does place an administrative hold on or
                    freeze some or all of your Digital Tokens, BCFLEX may continue such
                    hold until such time as the dispute has been resolved and evidence of
                    the resolution acceptable to BCFLEX has been provided to BCFLEX in a
                    form acceptable to BCFLEX. BCFLEX will not involve itself in any such
                    dispute or the resolution of the dispute.You agree that BCFLEX will
                    have no liability or responsibility for any losses, damages or prejudice
                    arising from or in connection with such hold or freeze, or for your
                    inability to withdraw Digital Tokens or execute trades during the period
                    of any such hold or freeze.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    12. Acceptable Use
                </BFText>

                <BFText textType={BFTextType.Text}>
                    12.1.When accessing or using the Services, you agree that you will not
                    violate any law or any contractual, intellectual property or other
                    third-party right or commit a tort, and that you are solely responsible
                    for your conduct while using our Services.Without limiting the
                    generality of the foregoing, you agree that you will not:
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Use our Services in any manner that could interfere with, disrupt,
                    negatively affect or inhibit other users from fully enjoying our
                    Services, or that could damage, disable, overburden or impair the
                    functioning of our Services or bring disrepute to our Services in any
                    manner;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Use our Services to pay for, support or otherwise engage in any illegal
                    gambling activities; fraud; market manipulation or abuse (including but
                    not limited to your taking actions, or acting in concert with another
                    user to take actions, on or outside the Services, which are intended to
                    deceive or mislead other users, or artificially control or manipulate
                    the price or trading volume of a Product); money-laundering; or
                    terrorist activities; or other illegal activities;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Use any robot, spider, crawler, scraper or other automated means or
                    interface not provided by us to access our Services or to extract data;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Use or attempt to use another user’s account without authorization;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Attempt to circumvent any content-filtering techniques we employ, or
                    attempt to access any service or area of our Services that you are not
                    authorized to access;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Introduce to the Services any malware, virus, trojan worms, logic bombs,
                    or other harmful material;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Develop any third-party applications that interact with our Services
                    without our prior written consent;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Provide false, inaccurate, or misleading information;
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Encourage or induce any third party to engage in any of the activities
                    prohibited under this section.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>13. Feedback </BFText>

                <BFText textType={BFTextType.Text}>
                    We will own exclusive rights, including all intellectual property
                    rights, to any feedback, suggestions, and ideas or other information or
                    materials regarding BCFLEX Exchange or our Services that you provide,
                    whether by email, posting through our Services or otherwise
                    (“Feedback”).Any Feedback you submit is non-confidential and shall
                    become the sole property of BCFLEX Exchange.We will be entitled to the
                    unrestricted use and dissemination of such Feedback for any purpose,
                    commercial or otherwise, without acknowledgment or compensation to you.
                    You waive any rights you may have to the Feedback (including any
                    copyrights).Do not send us Feedback if you expect to be paid or want to
                    continue to own or claim rights in them; your idea might be great, but
                    we may have already had the same or a similar idea and we do not want
                    disputes.You also acknowledge and agree that we have the right to
                    disclose your identity to any third party who is claiming that any
                    content posted by you constitutes a violation of their intellectual
                    property rights, or of their right to privacy.We have the right to
                    remove any posting you make on our website if, in our opinion, your post
                    does not comply with the content standards set out in our website.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    14. Copyrights and Other Intellectual Property Rights
                </BFText>

                <BFText textType={BFTextType.Text}>
                    14.1.Unless otherwise indicated by us, all copyright and other
                    intellectual property rights in all content and other materials
                    contained on our website or provided in connection with the Services,
                    including, without limitation, the BCFLEX Exchange or BCFLEX Exchange
                    logo and all designs, text, graphics, pictures, information, data,
                    software, sound files, other files and the selection and arrangement
                    thereof (collectively, “ BCFLEX Exchange Materials”) are the proprietary
                    property of BCFLEX Exchange or our licensors or suppliers and are
                    protected by international copyright laws and other intellectual
                    property rights laws.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    14.2.We hereby grant you a limited, nonexclusive, and non-sublicensable
                    license to access and use the BCFLEX Exchange Materials for your
                    personal use.Such license is subject to these Terms and does not permit
                    (a) any resale of the BCFLEX Exchange Materials; (b) the distribution,
                    public performance or public display of any BCFLEX Exchange Materials;
                    (c) modifying or otherwise making any derivative uses of the BCFLEX
                    Exchange Materials, or any portion thereof; or (d) any use of the
                   BCFLEX Exchange Materials other than for their intended purposes.The
                    license granted under this section will automatically terminate if we
                    suspend or terminate your access to the Services.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    15. Third-Party Content
                </BFText>

                <BFText textType={BFTextType.Text}>
                    In using our Services, you may view content provided by third parties,
                    including links to web pages of such parties, including but not limited
                    to Facebook and Twitter links (“Third-Party Content”).We do not
                    control, endorse or adopt any Third-Party Content and shall have no
                    responsibility for Third-Party Content, including without limitation
                    material that may be misleading, incomplete, erroneous, offensive,
                    indecent or otherwise objectionable.In addition, your business dealings
                    or correspondence with such third parties are solely between you and the
                    third parties.We are not responsible or liable for any loss or damage
                    of any sort incurred as the result of any such dealings, and you
                    understand that your use of Third-Party Content, and your interactions
                    with third parties, is at your own risk.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    16. Suspension; Termination
                </BFText>

                <BFText textType={BFTextType.Text}>
                    In the event of any Force Majeure Event (as defined in Section 22.6),
                    breach of these Terms or any laws or regulations, or any other event
                    that would make provision of the Services commercially unreasonable for
                   BCFLEX Exchange, we may, in our discretion and without liability to
                    you, with or without prior notice, suspend your access to all or a
                    portion of our Services and/or as may be required by applicable laws,
                    file a suspicious transaction report with the relevant authorities or
                    otherwise report to or inform the relevant authorities or take any other
                    steps to protect BCFLEX Exchange’s interests as BCFLEX Exchange deems
                    appropriate.We may also terminate your access to the Services in our
                    sole discretion, immediately and without prior notice, and delete or
                    deactivate your BCFLEX Exchange Account and all related information and
                    files in such account without liability to you, including, for instance,
                    in the event that you breach any term of these Terms.In the event of
                    discontinuation of all Services or termination of your access to the
                    Services or deletion or deactivation of your BCFLEX Exchange Account:
                    (a) all amounts payable by you to BCFLEX Exchange will immediately
                    become due; (b) BCFLEX Exchange may cancel any open orders or other
                    transaction requests that are pending at the time of discontinuation or
                    termination or deletion or deactivation; (c) BCFLEX Exchange will, where
                    possible, return any Funds stored in your BCFLEX Exchange Account not
                    otherwise owed to BCFLEX Exchange and/or will use commercially
                    reasonable efforts to provide you with a period of 90 days to transfer
                    affected Funds from your BCFLEX Exchange Account, unless prohibited by
                    applicable laws or regulations or by order of law enforcement or
                    governmental authority, or BCFLEX Exchange believes you have committed
                    fraud, negligence or other misconduct; and/or (d) BCFLEX Exchange may
                    take such other steps as BCFLEX Exchange deems necessary or desirable
                    to protect its own interests.We are not and shall not be responsible or
                    liable for any loss or damages incurred as a result of or arising from
                    any actions taken under this section.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    17. Discontinuance of Services
                </BFText>

                <BFText textType={BFTextType.Text}>
                    We may, in our sole discretion and without liability to you, with or
                    without prior notice and at any time, modify or discontinue, temporarily
                    or permanently, all or any portion of our Services, which may include
                    but is not limited to suspending trading in or ceasing to offer Services
                    in respect of any of the Products or prohibiting use of the Services in
                    or from certain jurisdictions.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    18. Disclaimer of Warranties
                </BFText>

                <BFText textType={BFTextType.Text}>
                    18.1.Except as expressly provided to the contrary in writing by us, our
                    services are provided on an “As is” and “As available” basis.We
                    expressly disclaim, and you waive, all warranties of any kind, whether
                    express or implied, including, without limitation, implied warranties of
                    merchantability, fitness for a particular purpose, title and
                    non-infringement as to our services, including the information, content
                    and materials contained therein, to the fullest extent permitted by
                    applicable laws.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    18.2.You acknowledge that information you store or transfer through our
                    services may become irretrievably lost or corrupted or temporarily
                    unavailable due to a variety of causes, including software failures,
                    protocol changes by third-party providers, internet outages, force
                    majeure event or other disasters including third-party Distributed
                    Denial of Service attacks, scheduled or unscheduled maintenance, or
                    other causes either within or outside our control.You are solely
                    responsible for backing up and maintaining duplicate copies of any
                    information you store or transfer through our Services.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Some jurisdictions do not allow the disclaimer of implied terms in
                    contracts with consumers, so some or all of the disclaimers in this
                    section may not apply to you.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    19. Limitation of Liability
                </BFText>

                <BFText textType={BFTextType.Text}>
                    19.1.Except as otherwise required by law, in no event shall BCFLEX
                    Exchange, our directors, officers, members, employees, agents or
                    contractors be liable for any special, indirect or consequential
                    damages, or any other damages of any kind, including but not limited to
                    loss of use, loss of profits or loss of data, whether in an action in
                    contract, tort (including but not limited to negligence) or otherwise,
                    arising out of or in any way connected with the use of or inability to
                    use our Services or the BCFLEX Exchange Materials, including without
                    limitation any damages caused by or resulting from reliance by any user
                    on any information obtained from BCFLEX Exchange, or that result from
                    mistakes, omissions, interruptions, deletion of files or email, errors,
                    defects, viruses, delays in operation or transmission or any failure of
                    performance, whether or not resulting from a force majeure event,
                    communications failure, theft of, destruction of or unauthorized access
                    to BCFLEX Exchange’s records, programs or services.
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Some jurisdictions do not allow the exclusion of certain warranties or
                    the limitation or exclusion of liability for incidental or consequential
                    damages.Accordingly, some of the limitations of this section may not
                    apply to you.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    19.2.To the maximum extent permitted by applicable law, in no event
                    shall the aggregate liability of BCFLEX Exchange (including our
                    directors, officers, members, employees, and agents), whether in
                    contract, warranty, tort (including negligence, whether active, passive
                    or imputed), product liability, strict liability or other theory,
                    arising out of or relating to the use of, or inability to use the
                    Services, BCFLEX Exchange or to these terms exceed the fees paid by you
                    to BCFLEX Exchange during the 12 months immediately preceding the date
                    of any claim giving rise to such liability.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    19.3.We have no control over, or liability for, the delivery, quality,
                    safety, legality or any other aspect of any Products that you may
                    purchase or sell to or from a user of the Services.We are not
                    responsible for ensuring that a third-party buyer or a seller you
                    transact with will complete a trade or transaction or is authorized to
                    do so.If you experience a problem with any Products or services
                    purchased from , or sold to, a user using the Services, or if you have a
                    dispute with such user, you should resolve the dispute directly with
                    that user.If you believe a user has behaved in a fraudulent,
                    misleading, or inappropriate manner, or if you cannot adequately resolve
                    a dispute with a third party, you may notify BCFLEX Exchange Help
                    Center if you have any questions.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    19.4.You acknowledge that there is no guarantee fund established or
                    other arrangements in place to cover or compensate you for any pecuniary
                    loss suffered by you as a result of any defaults by or the insolvency of
                    any other users of the Services.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>20. Indemnity </BFText>

                <BFText textType={BFTextType.Text}>
                    You agree to defend, indemnify and hold harmless BCFLEX Exchange (and
                    each of our officers, directors, members, employees, agents and
                    affiliates) from any claim, demand, action, damage, loss, cost or
                    expense, including without limitation reasonable attorneys’ fees,
                    arising out or relating to (a) your use of, or conduct in connection
                    with, our Services; (b) any Feedback you provide; (c) your violation of
                    these Terms or any agreement incorporated by reference in these Terms;
                    and/or (d) your violation of any rights of any other person or entity or
                    of any laws and regulations including but not limited to anti-money
                    laundering and countering the financing of terrorism laws and
                    regulations.If you are obligated to indemnify us, we will have the
                    right, in our sole discretion, to control any action or proceeding (at
                    our expense) and determine whether we wish to settle it.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    21. Applicable Law and Disputes Resolution
                </BFText>
                <BFText textType={BFTextType.Text}>
                    Please read the following paragraph carefully because it requires you to
                    settle disputes with us and it limits the manner in which you can seek
                    relief.
                </BFText>
                <BFText textType={BFTextType.Text}>
                    You and BCFLEX Exchange agree to notify each other in writing of any
                    dispute within thirty (30) days of when it arises.You and BCFLEX
                    Exchange further agree that you and BCFLEX Exchange shall spend not
                    less than three (3) months on full communication, consultation, or
                    mediation before either party submits the disputes in question for
                    litigation.If no settlement can be reached through consultation, the
                    litigation shall be under the jurisdiction of the court located in the
                    place where the plaintiff has his/her/its domicile.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    These Terms shall be governed by and construed in accordance with
                    English Common Law.The International Business Companies Act 2016 is the
                    principal legislation that governs corporates in the Republic of
                    Seychelles.
                </BFText>
                <BFText textType={BFTextType.SmallTitle}>
                    22. Insurance Fund
                </BFText>
                <BFText textType={BFTextType.Text}>
                    22.1 You acknowledge and agree that in the event that your particular
                    position is closed and unable to be better than the bankruptcy price,
                   BCFLEX Exchange shall have the right to use the insurance fund to make
                    up for the losses caused hereof with the intention of reducing the
                    possibility of auto-deleveraging.
                </BFText>
                <BFText textType={BFTextType.Text}>
                    22.2 You further acknowledge and agree that BCFLEX Exchange shall, at
                    its own sole discretion, determine: (a) whether to use the insurance
                    fund in a particular event; and (b) the specific amount of the insurance
                    fund to be spent in a particular event, and such decision shall be
                    final.
                </BFText>
                <BFText textType={BFTextType.Text}>
                    22.3 The above particular event set out in Section 22.2 shall include,
                    without limitation: (a) the downtime of the system; and (b) the hacker
                    attack which causes BCFLEX Exchange user assets to be stolen.
                </BFText>

                <BFText textType={BFTextType.Title}>
                    23. Miscellaneous
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.1.Entire Agreement; Order of Precedence.
                </BFText>

                <BFText textType={BFTextType.Text}>
                    These Terms contain the entire agreement and supersede all prior and
                    contemporaneous understandings between the parties regarding the
                    Services.These Terms do not alter the terms or conditions of any other
                    electronic or written agreement you may have with BCFLEX Exchange for
                    the Services or for any other BCFLEX Exchange product or service or
                    otherwise.In the event of any conflict between these Terms and any
                    other agreement you may have with BCFLEX Exchange, the terms of that
                    other agreement will prevail only if these Terms are specifically
                    identified and declared to be overridden by such other agreement.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.2.Third-Party Rights
                </BFText>

                <BFText textType={BFTextType.Text}>
                    A person who is not a party to these Terms has no right to enforce any
                    term of these Terms.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.3.Amendment
                </BFText>

                <BFText textType={BFTextType.Text}>
                    We reserve the right to make changes or modifications to these Terms
                    from time to time, in our sole discretion.If we make changes to these
                    Terms, we will provide you with notice of such changes, such as by
                    sending an email, providing notice on the homepage of our website and/or
                    by posting the amended Terms via the applicable BCFLEX Exchange
                    websites and mobile applications and updating the “Last Updated” date at
                    the top of these Terms.The amended Terms will be deemed effective
                    immediately upon posting for any new users of the Services.In all other
                    cases, the amended Terms will become effective for preexisting users
                    upon the earlier of either: (i) the date users click or press a button
                    to accept such changes, or (ii) continued use of our Services 30 days
                    after BCFLEX Exchange provides notice of such changes.Any amended
                    Terms will apply prospectively to use of the Services after such changes
                    become effective in accordance with these Terms.If you do not agree to
                    any amended Terms, you must discontinue using our Services and contact
                    us to terminate your account.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>23.4.Waiver</BFText>

                <BFText textType={BFTextType.Text}>
                    Our failure or delay in exercising any right, power or privilege under
                    these Terms shall not operate as a waiver thereof.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.5.Severability
                </BFText>

                <BFText textType={BFTextType.Text}>
                    The invalidity or unenforceability of any of these Terms shall not
                    affect the validity or enforceability of any other of these Terms, all
                    of which shall remain in full force and effect.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.6.Force Majeure Events
                </BFText>

                <BFText textType={BFTextType.Text}>
                   BCFLEX Exchange shall not be liable for (1) any inaccuracy, error,
                    failure, delay in, or omission of (i) any information, (ii) the
                    transmission or delivery of information, or (iii) carrying out its
                    obligations under these Terms; (2) any loss or damage in any and all
                    cases arising from any event beyond BCFLEX Exchange’s reasonable
                    control, including but not limited to flood, extraordinary weather
                    conditions, earthquake, or other act of God, fire, war, insurrection,
                    riot, labor dispute, accident, action of government, terrorist attacks,
                    market failure or disruption, telecommunications or network breakdown or
                    disruption, communications, power failure, attacks on the security,
                    integrity or operation of the Products, the Services and/or the BCFLEX
                    Exchange Accounts and Funds held therein, or equipment or software
                    malfunction or any other cause beyond BCFLEX Exchange’s reasonable
                    control (each, a “Force Majeure Event”).
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.7.Assignment
                </BFText>

                <BFText textType={BFTextType.Text}>
                    You may not assign or transfer any of your rights or obligations under
                    these Terms without prior written consent from BCFLEX Exchange,
                    including by operation of law or in connection with any change of
                    control. BCFLEX Exchange may assign or transfer any or all of its
                    rights under these Terms, in whole or in part, without obtaining your
                    consent or approval.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>23.8.Headings</BFText>

                <BFText textType={BFTextType.Text}>
                    Headings of sections are for convenience only and shall not be used to
                    limit or construe such sections.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.9.Governing language and translations
                </BFText>

                <BFText textType={BFTextType.Text}>
                    These Terms, the Privacy Policy, and other agreements or communications
                    notified through the Services have been drafted in English.Although
                    translations in other languages of any of the foregoing documents may be
                    available, such translations may not be up to date or complete.
                    Accordingly, you agree that in the event of any conflict between the
                    English language version of the foregoing documents and any other
                    translations thereof, the English language version of such documents
                    shall govern and prevail.
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>
                    23.10.Survival
                </BFText>

                <BFText textType={BFTextType.Text}>
                    Sections 2 (Eligibility), Section 3 ( BCFLEX Exchange Account), Section
                    8 (Risk Disclosure), Section 9 (Fees), Section 11 (Unclaimed Property),
                    Section 13 (Feedback), Section 14 (Copyrights and other Intellectual
                    Property Rights), Section 15 (Third-Party Content), Section 18
                    (Disclaimer of Warranties), Section 19 (Limitation of Liability),
                    Section 20 (Indemnity), Section 21 (Applicable Law; Arbitration) and
                    this Section 22 (Insurance Fund), Section 23(Miscellaneous) shall
                    survive any termination or expiration of these Terms.
                </BFText>


                <BFText textType={BFTextType.Text}>
                    User confirms and agrees to <NavLink to={'/terms'}>Terms of Use</NavLink>
                </BFText>




            </div>
        </StaticPagesLayout>


    );
}
