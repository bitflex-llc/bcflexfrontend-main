import React, { RefObject, useEffect, useState } from "react";

import { FaTimesCircle } from "react-icons/fa";
import Modal from 'react-modal';
import { SetBlur } from "../../store/actions";
import { Store } from "../../store";
import { Trans } from 'react-i18next';

export function BFModalWindow({
    isOpen,
    parentDivRef,
    title,
    onClose,
    children,
    noPadding = false,
    keepBlurred
}: {
    isOpen: boolean,
    parentDivRef?: RefObject<HTMLDivElement>,
    title: string,
    onClose: () => void,

    children: React.ReactNode,
    noPadding?: boolean,
    keepBlurred?: boolean
}) {

    const {
        state: { },
        dispatch
    } = React.useContext(Store);

    const [isOpenInside, setisOpenInside] = useState(isOpen);


    useEffect(() => {
        setisOpenInside(isOpen)
        SetBlur(isOpenInside, dispatch)

        if (keepBlurred && isOpen)
            SetBlur(true, dispatch)

        return () => {
            setisOpenInside(false)
            SetBlur(false, dispatch)
        }
    }, [dispatch, isOpen, isOpenInside, keepBlurred]);


    return (
        <>
            <Modal
                isOpen={isOpenInside}
                className="Modal-inPanel"
                shouldCloseOnEsc={true}
                shouldCloseOnOverlayClick={true}
                onRequestClose={onClose}
                contentLabel={title}
                overlayClassName="Overlay">
                <div className={'bf-dash-header'}>
                    <div style={{ display: 'flex' }}>
                        <Trans>{title}</Trans>
                    </div>

                    <div style={{ marginTop: 5, cursor: 'pointer' }} onClick={onClose}><FaTimesCircle /></div>
                </div>
                <div className="">
                    {children}
                </div>
            </Modal>
        </>
    );
}