import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';
import { BFText, BFTextType } from './affiliate';

import { NavMenu } from '../NavMenu';
import React from 'react';
import { isMobile } from 'react-device-detect';

export default function Legal() {
    return (
        <StaticPagesLayout article={ArticleType.Legal} isDashboard={false}>
            <div style={{ padding: isMobile ? 12 : 30 }}>
                <BFText textType={BFTextType.Title}>Legal Information</BFText>

                <BFText textType={BFTextType.SmallTitle}>Vendor:</BFText>
                <BFText textType={BFTextType.Text}>
                    Flex Technologies Limited, Seychelles, 235694 (ex. BCFLEX LLC)
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>Address:</BFText>
                <BFText textType={BFTextType.Text}>
                    Suite 1, Second Floor, Sound & Vision House, Francis Rachel Str., Victoria, Mahe, Seychelles
                </BFText>

                <BFText textType={BFTextType.SmallTitle}>Representative Person:</BFText>
                <BFText textType={BFTextType.Text}>
                    CEO, George Tagirov, <a href="https://t.me/georgetagirov" target='_blank'>https://t.me/georgetagirov</a>
                </BFText>



            </div>
        </StaticPagesLayout>


    );
}
