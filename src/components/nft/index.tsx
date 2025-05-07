import { useEffect, useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans } from "react-i18next";

import { isMobile } from "react-device-detect";
import Colors from "../../Colors";
import { StylesDictionary } from "../dashboard/settings/ApiKeys";
import { BitflexOpenApi } from "../../_helpers/BitflexOpenApi";
import {TradeDirection } from "../../api-wrapper";
import { Layout } from "./layout";



export default function NFT() {

    return <Layout>

        <section id="home2">
            {/* BG */}
            {/* !BG */}
            <div className="container">
                <h3 className="fn__maintitle big" data-text="NFT Digital Art" data-align="center">NFT Digital Art</h3>
                <div className="fn_cs_desc">
                    <p> BCFLEX represent a collection of digital art, created by real creators and illustrators. The arts are stored as ERC-1155 (with EIP-2981 Royalty) tokens on the BCFLEX Blockchain and hosted on Interplanetary File System.</p>
                </div>
            </div>



            <div className="frenify_cards_gallery" data-initial-width={540} data-ratio="0.925">
                <ul style={{ height: '539.5px' }}>

                 <li className="current" style={{ width: '540px', height: '539.5px', transform: 'scale(1) ', top: '90px' }}>
                        <div className="img_holder">
                            <div className="item_in">
                                <div className="o_img"  data-bg-img="/asset/img/jpeg-optimizer_C7331DC2-1645-4D73-8958-5D5552001F36.jpeg" style={{ backgroundImage: 'url("https://downloader.disk.yandex.ru/preview/22344f71f857ac8186fbd7f0ba3e3292a392373eee82d002fe50fc3b3bbde810/63d002a7/mtEOZ40Q7Hg_1VgE1zEMvwJNAypP3F3Pr2jZep7f-TTln_xP9PQGTVavyOtiOzlc9G7xTFJ_WIh4AtwgpzOLUw%3D%3D?uid=0&filename=C7331DC2-1645-4D73-8958-5D5552001F36.jpeg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=2048x2048")' }} />
                                <img src="img/1x1.jpg" alt="" style={{ width: '540px', height: '499.5px' }} />
                            </div>
                        </div>
                    </li>
                       {/* 
                    <li className="next2" style={{ width: '540px', height: '539.5px', left: '1442px', transform: 'scale(1) translateZ(0px) rotate(30deg)', top: '240px' }}>
                        <div className="img_holder">
                            <div className="item_in">
                                <div className="o_img" data-bg-img="/asset/img/jpeg-optimizer_C7331DC2-1645-4D73-8958-5D5552001F36.jpeg" style={{ backgroundImage: 'url("https://downloader.disk.yandex.ru/preview/22344f71f857ac8186fbd7f0ba3e3292a392373eee82d002fe50fc3b3bbde810/63d002a7/mtEOZ40Q7Hg_1VgE1zEMvwJNAypP3F3Pr2jZep7f-TTln_xP9PQGTVavyOtiOzlc9G7xTFJ_WIh4AtwgpzOLUw%3D%3D?uid=0&filename=C7331DC2-1645-4D73-8958-5D5552001F36.jpeg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=2048x2048")' }} />
                                <img src="img/1x1.jpg" alt="" style={{ width: '540px', height: '499.5px' }} />
                            </div>
                        </div>
                    </li>
                    <li className="next3" style={{ width: '540px', height: '539.5px', left: '1658px', transform: 'scale(1) translateZ(0px) rotate(45deg)', top: '360px' }}>
                        <div className="img_holder">
                            <div className="item_in">
                                <div className="o_img"  data-bg-img="/asset/img/jpeg-optimizer_C7331DC2-1645-4D73-8958-5D5552001F36.jpeg" style={{ backgroundImage: 'url("https://downloader.disk.yandex.ru/preview/22344f71f857ac8186fbd7f0ba3e3292a392373eee82d002fe50fc3b3bbde810/63d002a7/mtEOZ40Q7Hg_1VgE1zEMvwJNAypP3F3Pr2jZep7f-TTln_xP9PQGTVavyOtiOzlc9G7xTFJ_WIh4AtwgpzOLUw%3D%3D?uid=0&filename=C7331DC2-1645-4D73-8958-5D5552001F36.jpeg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=2048x2048")' }} />
                                <img src="img/1x1.jpg" alt="" style={{ width: '540px', height: '499.5px' }} />
                            </div>
                        </div>
                    </li>


                    <li className="prev2" style={{ width: '540px', height: '539.5px', left: '578px', transform: 'scale(1) translateZ(0px) rotate(-30deg)', top: '240px' }}>
                        <div className="img_holder">
                            <div className="item_in">
                                <div className="o_img" data-bg-img="img/drops/8.jpg" style={{ backgroundImage: 'url("https://downloader.disk.yandex.ru/preview/22344f71f857ac8186fbd7f0ba3e3292a392373eee82d002fe50fc3b3bbde810/63d002a7/mtEOZ40Q7Hg_1VgE1zEMvwJNAypP3F3Pr2jZep7f-TTln_xP9PQGTVavyOtiOzlc9G7xTFJ_WIh4AtwgpzOLUw%3D%3D?uid=0&filename=C7331DC2-1645-4D73-8958-5D5552001F36.jpeg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=2048x2048")' }} />
                                <img src="img/1x1.jpg" alt="" style={{ width: '540px', height: '499.5px' }} />
                            </div>
                        </div>
                    </li>
                    <li className="prev1" style={{ width: '540px', height: '539.5px', left: '794px', transform: 'scale(1) translateZ(0px) rotate(-15deg)', top: '90px' }}>
                        <div className="img_holder">
                            <div className="item_in">
                                <div className="o_img" data-bg-img="img/drops/9.jpg" style={{ backgroundImage:'url("https://downloader.disk.yandex.ru/preview/22344f71f857ac8186fbd7f0ba3e3292a392373eee82d002fe50fc3b3bbde810/63d002a7/mtEOZ40Q7Hg_1VgE1zEMvwJNAypP3F3Pr2jZep7f-TTln_xP9PQGTVavyOtiOzlc9G7xTFJ_WIh4AtwgpzOLUw%3D%3D?uid=0&filename=C7331DC2-1645-4D73-8958-5D5552001F36.jpeg&disposition=inline&hash=&limit=0&content_type=image%2Fjpeg&owner_uid=0&tknv=v2&size=2048x2048")'}} />
                                <img src="img/1x1.jpg" alt="" style={{ width: '540px', height: '499.5px' }} />
                            </div>
                        </div>
                    </li> */}
                </ul>
            </div>
            {/* !Card Slider */}
        </section>

    </Layout>
}

