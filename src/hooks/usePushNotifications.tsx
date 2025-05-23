import {
    askUserPermission,
    createNotificationSubscription,
    getUserSubscription,
    isPushNotificationSupported,
    registerServiceWorker
} from "./push-notifications";
import { useEffect, useState } from "react";

//the function to call the push server: https://github.com/Spyna/push-notification-demo/blob/master/front-end-react/src/utils/http.js

//import all the function created to manage the push notifications

const pushNotificationSupported = isPushNotificationSupported();
//first thing to do: check if the push notifications are supported by the browser

export default function usePushNotifications() {
    const [userConsent, setSuserConsent] = useState(Notification.permission);
    //to manage the user consent: Notification.permission is a JavaScript native function that return the current state of the permission
    //We initialize the userConsent with that value
    const [userSubscription, setUserSubscription] = useState<PushSubscription | null>(null);
    //to manage the use push notification subscription
    const [pushServerSubscriptionId, setPushServerSubscriptionId] = useState();
    //to manage the push server subscription
    const [error, setError] = useState<boolean | object>(false);
    //to manage errors
    const [loading, setLoading] = useState(true);
    //to manage async actions

    useEffect(() => {
        if (pushNotificationSupported) {
            setLoading(true);
            setError(false);
            registerServiceWorker().then(() => {
                setLoading(false);
            });
        }
    }, []);
    //if the push notifications are supported, registers the service worker
    //this effect runs only the first render

    useEffect(() => {
        setLoading(true);
        setError(false);
        const getExixtingSubscription = async () => {
            const existingSubscription = await getUserSubscription();
            setUserSubscription(existingSubscription);
            setLoading(false);
        };
        getExixtingSubscription();
    }, []);
    //Retrieve if there is any push notification subscription for the registered service worker
    // this use effect runs only in the first render

    /**
     * define a click handler that asks the user permission,
     * it uses the setSuserConsent state, to set the consent of the user
     * If the user denies the consent, an error is created with the setError hook
     */
    const onClickAskUserPermission = () => {
        setLoading(true);
        setError(false);
        askUserPermission().then(consent => {
            setSuserConsent(consent);
            if (consent !== "granted") {
                setError(true)
                setError({
                    name: "Consent denied",
                    message: "You denied the consent to receive notifications",
                    code: 0
                });
            }
            setLoading(false);
        });
    };
    //

    /**
     * define a click handler that creates a push notification subscription.
     * Once the subscription is created, it uses the setUserSubscription hook
     */
    const onClickSusbribeToPushNotification = () => {
        setLoading(true);
        setError(false);
        createNotificationSubscription()
            .then(function (subscrition) {
                setUserSubscription(subscrition);
                setLoading(false);
            })
            .catch(err => {
                console.error("Couldn't create the notification subscription", err, "name:", err.name, "message:", err.message, "code:", err.code);
                setError(err);
                setLoading(false);
            });
    };



    const unregister = async () => {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister()
            }
        }).catch(function (err) {
            console.log('Service Worker registration remove failed: ', err);
        });
    }

    /**
     * returns all the stuff needed by a Component
     */
    return {
        onClickAskUserPermission,
        onClickSusbribeToPushNotification,
        pushServerSubscriptionId,
        userConsent,
        pushNotificationSupported,
        userSubscription,
        error,
        loading,
        unregister
    };
}