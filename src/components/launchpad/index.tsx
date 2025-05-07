import '../../css/navmenu.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Layout } from './layout';

import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

export default function Launchpad() {
    return <Layout>
        <div id="">
            <section className="page-title">
                <div className="swiper-slide swiper-slide-active" role="group">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="box-slider">
                                    <div className="content-box">
                                        <h1 className="title">Become an early investor in FLEX Network Ecosystem</h1>
                                        <p className="sub-title">FLEX Network is the blockchain-based ecosystem, consist of propietary blockchain, centralized exchange,<br className="show-destop" /> NFT marketplace, p2p trading and decentralized FLEX wallet.</p>

                                        <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text="GET THE WHITEPAPER" width={200}></BFGradientButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="bg_body">
                <section className="tf-section roadmap">
                    <div className="container w_1342">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="tf-title aos-init" data-aos="fade-up" data-aos-duration={800}>
                                    <h2 className="title">
                                        Roadmap
                                    </h2>
                                </div>
                            </div>
                            <div className="col-md-12">
                                <VerticalTimeline
                                    lineColor={'#b89e14'}
                                >
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--work"
                                        contentStyle={{ background: 'linear-gradient(90deg, rgba(35, 44, 54, 0) -0.24%, #1A222C 100%)', color: '#b89e14', boxShadow: "0 0px 0 #ddd", border: "1px solid gold" }}
                                        contentArrowStyle={{ borderRight: '5px solid gold' }}
                                        date="2011 - present"
                                        iconStyle={{ background: '#b89e14', color: '#b89e14' }}
                                        lineColor={'#b89e14'}

                                    // icon={ }
                                    >
                                        <h3 className="vertical-timeline-element-title">Creative Director</h3>
                                        <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
                                        <p>
                                            Creative Direction, User Experience, Visual Design, Project Management, Team Leading
                                        </p>
                                    </VerticalTimelineElement>
                                    <VerticalTimelineElement
                                        className="vertical-timeline-element--work"
                                        contentStyle={{ background: 'linear-gradient(90deg, rgba(35, 44, 54, 0) -0.24%, #1A222C 100%)', color: '#b89e14', boxShadow: "0 0px 0 #ddd", border: "1px solid gold" }}
                                        contentArrowStyle={{ borderRight: '5px solid gold' }}
                                        date="2011 - present"
                                        iconStyle={{ background: '#b89e14', color: '#b89e14' }}
                                        lineColor={'#b89e14'}

                                    // icon={ }
                                    >
                                        <h3 className="vertical-timeline-element-title">Creative Director</h3>
                                        <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
                                        <p>
                                            Creative Direction, User Experience, Visual Design, Project Management, Team Leading
                                        </p>
                                    </VerticalTimelineElement>

                                    <VerticalTimelineElement
                                        iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}

                                    />
                                </VerticalTimeline>
                                <div className="container_inner roadmap_boder">
                                    <div className="roadmap-wrapper">

                                        <div className="swiper-wrapper" aria-live="polite" style={{ transform: 'translate3d(0px, 0px, 0px)', display: 'flex' }}>
                                            <div className="swiper-slide swiper-slide-active" role="group" aria-label="1 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box active">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide swiper-slide-next" role="group" aria-label="2 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box active">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="3 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box active">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="4 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box active">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="5 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="6 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="7 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="swiper-slide" role="group" aria-label="8 / 8" style={{ width: '247px', marginRight: '30px' }}>
                                                <div className="roadmap-box">
                                                    <div className="icon">
                                                        <img src="assets/images/common/icon_roadmap.svg" alt="" />
                                                    </div>
                                                    <div className="content">
                                                        <h6 className="date">April 16, 2022</h6>
                                                        <ul>
                                                            <li>Cras molestie ullamcorper augue nec pulvinar</li>
                                                            <li>Nam mollis sapien ut sapien gravida sollicitudin</li>
                                                            <li>Mauris vel nisl quis dolor accumsan luctus</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="swiper-notification" aria-live="assertive" aria-atomic="true" /></div>


                                </div>
                            </div>
                        </div>
                    </div>
                </section>


            </div>

            <section className="tf-section tf_CTA">
                <div className="container relative">
                    <div className="overlay">
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="tf-title left mt58 aos-init" data-aos="fade-up" data-aos-duration={800}>
                                <h2 className="title">
                                    Launch on FLEX
                                </h2>
                                <p className="sub">Full support in project incubation</p>
                                <div className="wrap-btn">
                                    <a href="submit-IGO-on-chain.html" className="tf-button style3">
                                        Apply Now
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="image_cta aos-init" data-aos="fade-left" data-aos-duration={1200}>
                                <img className="move4" src="assets/images/common/img_cta.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div>


    </Layout>
}