import { useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useParams } from 'react-router-dom';

export function Invite() {
    let { refId } = useParams<{ refId: string }>();
    const [, setbitflexUserGuid] = useLocalStorage('refId', '');
    useEffect(() => {
        if (refId !== undefined) {
            setbitflexUserGuid(refId)
            setTimeout(() => {
                window.location.href = '/signup'
            }, 50)
        }
    }, [refId, setbitflexUserGuid])
    return (<div></div>);
}
