import { useContext, useEffect } from 'react';

import { SetBlur } from '../store/actions';
/* eslint-disable jsx-a11y/alt-text */
import { StaticPagesLayout } from './staticpages/StaticPagesLayout';
import { Store } from '../store';
import loading_png from '../images/loading.svg'

export const ConfirmationDialog = ({ isActive, onConfirmation, onCancel }): JSX.Element => {
    const {
        state: { currencies },
        dispatch
    } = useContext(Store);

    useEffect(() => {
        SetBlur(isActive, dispatch);
    }, [isActive])

    if (isActive)
        return <div className={'overlayModal'}>
            ARE YOU SURE TO REMOVE
        <button onClick={onConfirmation}>YES</button>

            <button onClick={onCancel}>NO</button>
        </div>
    else
        return <></>
}