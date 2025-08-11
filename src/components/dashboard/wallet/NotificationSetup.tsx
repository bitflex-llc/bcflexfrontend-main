import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBell, FaBellSlash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
// import { usePushNotifications } from '../../../hooks/usePushNotifications';
import Colors from '../../../Colors';
import usePushNotifications from '../../../hooks/usePushNotifications';

interface NotificationSetupProps {
  bitflexDeviceId: string;
  publicKey?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const NotificationSetup: React.FC<NotificationSetupProps> = ({
  bitflexDeviceId,
  publicKey,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  
  const {
    permission,
    isSupported,
    isSetup,
    isLoading,
    error,
    canRequestPermission,
    needsUserAction,
    requestPermission,
    getInstructions
  } = usePushNotifications({
    bitflexDeviceId,
    publicKey,
    onSuccess,
    onError
  });

  const handleEnableNotifications = async () => {
    const success = await requestPermission();
    if (success) {
      onSuccess?.();
    }
  };

  const getStatusColor = () => {
    if (error) return Colors.bitFlexRedColor;
    if (isSetup) return Colors.bitFlexGreenColor;
    if (permission === 'denied') return Colors.bitFlexRedColor;
    return Colors.bitFlexGoldenColor;
  };

  const getStatusIcon = () => {
    if (error) return <FaExclamationTriangle color={Colors.bitFlexRedColor} />;
    if (isSetup) return <FaCheckCircle color={Colors.bitFlexGreenColor} />;
    if (permission === 'denied') return <FaBellSlash color={Colors.bitFlexRedColor} />;
    return <FaBell color={Colors.bitFlexGoldenColor} />;
  };

  const getStatusText = () => {
    if (error) return t('Notification setup failed');
    if (isSetup) return t('Notifications enabled');
    if (permission === 'denied') return t('Notifications blocked');
    if (permission === 'granted') return t('Notifications allowed');
    return t('Notifications not configured');
  };

  if (!isSupported) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <FaInfoCircle color={Colors.bitFlexGoldenColor} size={20} />
          <h3 style={styles.title}>{t('Push Notifications')}</h3>
        </div>
        <p style={styles.description}>
          {t('Push notifications are not supported on this device or browser.')}
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {getStatusIcon()}
        <h3 style={styles.title}>{t('Push Notifications')}</h3>
        <span style={{ ...styles.status, color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>

      <p style={styles.description}>
        {t('Enable push notifications to receive real-time updates about your trades, deposits, withdrawals, and important account activities.')}
      </p>

      {error && (
        <div style={styles.errorBox}>
          <FaExclamationTriangle color={Colors.bitFlexRedColor} />
          <span style={styles.errorText}>{error}</span>
        </div>
      )}

      {(needsUserAction || canRequestPermission) && (
        <>
          <div style={styles.instructionsBox}>
            <h4 style={styles.instructionsTitle}>{t('Setup Instructions:')}</h4>
            <ul style={styles.instructionsList}>
              {getInstructions().map((instruction, index) => (
                <li key={index} style={styles.instructionItem}>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.buttonContainer}>
            <BFGradientButton
              text={t('Enable Notifications')}
              buttonType={BFGradientButtonType.Action}
              onPress={handleEnableNotifications}
              isLoading={isLoading}
              width="200px"
            />
          </div>
        </>
      )}

      {permission === 'denied' && (
        <div style={styles.instructionsBox}>
          <h4 style={styles.instructionsTitle}>{t('Notifications Blocked - How to Enable:')}</h4>
          <ul style={styles.instructionsList}>
            <li style={styles.instructionItem}>
              {t('Click the 🔒 or ⚙️ icon in your browser\'s address bar')}
            </li>
            <li style={styles.instructionItem}>
              {t('Change "Notifications" setting to "Allow"')}
            </li>
            <li style={styles.instructionItem}>
              {t('Refresh this page and try again')}
            </li>
            <li style={styles.instructionItem}>
              {t('Or check your browser\'s notification settings')}
            </li>
          </ul>
        </div>
      )}

      {isSetup && (
        <div style={styles.successBox}>
          <FaCheckCircle color={Colors.bitFlexGreenColor} />
          <span style={styles.successText}>
            {t('Great! You\'ll now receive push notifications for important account activities.')}
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    border: `1px solid ${Colors.BITFLEXBorderTerminal}`,
    margin: '20px 0'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  title: {
    color: 'white',
    fontSize: '18px',
    margin: 0,
    fontWeight: 'bold'
  },
  status: {
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: 'auto'
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    border: `1px solid ${Colors.bitFlexRedColor}`,
    borderRadius: '4px',
    marginBottom: '16px'
  },
  errorText: {
    color: Colors.bitFlexRedColor,
    fontSize: '14px'
  },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    border: `1px solid ${Colors.bitFlexGreenColor}`,
    borderRadius: '4px',
    marginTop: '16px'
  },
  successText: {
    color: Colors.bitFlexGreenColor,
    fontSize: '14px'
  },
  instructionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  instructionsTitle: {
    color: 'white',
    fontSize: '16px',
    marginBottom: '12px',
    fontWeight: 'bold'
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px'
  },
  instructionItem: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginBottom: '8px',
    lineHeight: '1.4'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px'
  }
};

export default NotificationSetup;