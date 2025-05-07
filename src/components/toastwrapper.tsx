import 'react-notifications-component/dist/theme.css';
import 'animate.css';

import { Store } from 'react-notifications-component';

export function toastSuccess(text) {
    Store.addNotification({
        title: 'Success',
        message: text,
        type: 'success',                         // 'default', 'success', 'info', 'warning'
        container: 'bottom-left',
        animationIn: ["animated", "fadeIn"],     // animate.css classes
        animationOut: ["animated", "fadeOut"],   // animate.css classes
        dismiss: {
          duration: 10000,
          showIcon: true
        }
      })
}

export function toastError(text) {
    Store.addNotification({
        title: 'Error',
        message: text,
        type: 'warning',                         // 'default', 'success', 'info', 'warning'
        container: 'bottom-left',
        animationIn: ["animated", "fadeIn"],     // animate.css classes
        animationOut: ["animated", "fadeOut"],   // animate.css classes
        dismiss: {
          duration: 3000,
          showIcon: true
        }
      })
}


export function toastInfo(text) {
    Store.addNotification({
        title: 'Information',
        message: text,
        type: 'info',                         // 'default', 'success', 'info', 'warning'
        container: 'bottom-left',
        animationIn: ["animated", "fadeIn"],     // animate.css classes
        animationOut: ["animated", "fadeOut"],   // animate.css classes
        dismiss: {
          duration: 3000,
          showIcon: true
        }
      })
}

