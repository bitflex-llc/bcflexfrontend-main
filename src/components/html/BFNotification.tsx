import { Ref, forwardRef, useImperativeHandle, useState } from "react";

/* eslint-disable jsx-a11y/alt-text */
import { makeid } from "./BFInput";

export interface IBFNotification {
    Notify: (title: string,
        message: string,
        type: BFNotificationType) => void
}

export enum BFNotificationType {
    Success,
    Error,
    Warning,
    Information
}

function GetClass(_buttonType: BFNotificationType): string {
    switch (_buttonType) {
        case BFNotificationType.Success: return 'success';
        case BFNotificationType.Error: return 'error';
        case BFNotificationType.Warning: return 'warning';
        case BFNotificationType.Information: return 'information';
    }
}

export const BFNotification = forwardRef((
    props: {

    },
    ref: Ref<IBFNotification>) => {

    const [message, setmessage] = useState<string>();
    const [title, setTitle] = useState<string>();
    const [type, setType] = useState<BFNotificationType>();

    const [isActive, setisActive] = useState(false);

    const [timeoutTimer, settimeoutTimer] = useState<NodeJS.Timeout>();

    const [wasStopped, setwasStopped] = useState(false);

    var elemrandId = makeid(12);

    function Hide() {
        setisActive(false)
        setmessage(undefined)
        setTitle(undefined)
        setType(undefined)
        settimeoutTimer(undefined)
    }

    function Notify(title: string, message: string, type: BFNotificationType) {
        setmessage(message)
        setTitle(title)
        setType(type)
        setisActive(true)

        settimeoutTimer(setTimeout(() => {
            Hide();
        }, 5000));

    }

    useImperativeHandle(ref, () => ({ Notify }));

    return <div id={elemrandId} className={'bf-notification-note ' + GetClass(type!) + ' ' + (isActive ? 'show' : 'hide')}
        onMouseEnter={() => {
            clearTimeout(timeoutTimer!)
            setwasStopped(true)
        }}
        onMouseLeave={() => {
            if (wasStopped)
                Hide();
        }}
    >
        <div style={{ margin: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 400 }}>{BFNotificationType[type!]}</div>
            <div style={{ fontSize: 16, marginTop: 7 }}>{message}</div>
        </div>
    </div >
});

// export const BFNotification = React.forwardRef({

// }: {

// }): JSX.Element => {
//     const {
//         state: { averageColor }
//     } = React.useContext(Store);

//     const { isSignedIn } = useUserState();

//     const { t } = useTranslation();


//     return (
//         <div >

//         </div>
//     )
// }