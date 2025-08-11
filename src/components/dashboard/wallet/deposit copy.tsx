import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { FaDotCircle, FaWallet, FaCopy, FaShieldAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';

import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../../html/BFNotification';


import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { GetAddressResponse } from '../../../api-wrapper';
import { ICurrency } from '../../../store/types';
import { Store } from '../../../store';

import Colors from '../../../Colors';
import { LoadingComponent } from '../../LoadingComponent';

// ====================================================================================
// TYPES
// ====================================================================================

interface NetworkCurrency {
  networkCurrencyId: number;
  name: string;
  imageBase64: string;
  adreess: string; // Note: API typo maintained for compatibility
  fee?: number;
  estimatedTime?: string;
}

interface DepositModalProps {
  currency: string;
  onClose: () => void;
}

interface NetworkSelectorProps {
  isSelected: boolean;
  onSelect: () => void;
  network: NetworkCurrency;
  isRecommended?: boolean;
}

// ====================================================================================
// STYLES
// ====================================================================================

const styles = {
  container: {
    padding: '20px',
    maxWidth: '100%',
    minHeight: '400px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    gap: '16px'
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px'
  },
  generateContainer: {
    textAlign: 'center' as const,
    padding: '40px 20px'
  },
  generateIcon: {
    fontSize: '48px',
    color: Colors.bitFlexGoldenColor,
    marginBottom: '16px'
  },
  generateTitle: {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px'
  },
  generateDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '32px',
    maxWidth: '600px',
    margin: '0 auto 32px'
  },
  currencyHighlight: {
    color: Colors.bitFlexGoldenColor,
    fontWeight: 'bold'
  },
  networkSection: {
    marginBottom: '24px'
  },
  networkTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  networkSelector: {
    width: '100%',
    cursor: 'pointer',
    marginBottom: '12px'
  },
  networkCard: (isSelected: boolean, isRecommended: boolean) => ({
    background: isSelected 
      ? `linear-gradient(135deg, ${Colors.bitFlexGoldenColor}20, transparent)`
      : 'rgba(255, 255, 255, 0.05)',
    border: `2px ${isSelected ? 'solid' : 'dashed'} ${
      isSelected ? Colors.bitFlexGoldenColor : Colors.BITFLEXBorder
    }`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    position: 'relative' as const
  }),
  recommendedBadge: {
    position: 'absolute' as const,
    top: '-8px',
    right: '16px',
    background: Colors.bitFlexGreenColor,
    color: 'white',
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: 'bold'
  },
  networkInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  networkImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const
  },
  networkDetails: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  networkName: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  networkMeta: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px'
  },
  networkStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  selectedIcon: (isSelected: boolean) => ({
    fontSize: '20px',
    color: isSelected ? Colors.bitFlexGoldenColor : 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease'
  }),
  depositSection: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '24px',
    alignItems: 'start',
    marginTop: '24px'
  },
  qrContainer: {
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  addressTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  addressInputContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  addressInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${Colors.BITFLEXBorder}`,
    borderRadius: '8px',
    padding: '12px',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none',
    cursor: 'text'
  },
  warningBox: {
    background: 'rgba(244, 67, 54, 0.1)',
    border: `1px solid ${Colors.bitFlexRedColor}`,
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px'
  },
  warningText: {
    color: Colors.bitFlexRedColor,
    fontSize: '14px',
    fontWeight: '500'
  },
  infoBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${Colors.BITFLEXBorder}`,
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px'
  },
  infoIcon: {
    color: Colors.bitFlexGoldenColor,
    fontSize: '16px'
  },
  mobileLayout: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  mobileQrContainer: {
    display: 'flex',
    justifyContent: 'center'
  }
};

// ====================================================================================
// COMPONENTS
// ====================================================================================

const NetworkSelector: React.FC<NetworkSelectorProps> = React.memo(({ 
  isSelected, 
  onSelect, 
  network,
  isRecommended = false 
}) => {
  return (
    <div style={styles.networkSelector} onClick={onSelect}>
      <div style={styles.networkCard(isSelected, isRecommended)}>
        {isRecommended && (
          <div style={styles.recommendedBadge}>RECOMMENDED</div>
        )}
        
        <div style={styles.networkInfo}>
          <img 
            src={network.imageBase64} 
            alt={network.name}
            style={styles.networkImage}
            loading="lazy"
          />
          <div style={styles.networkDetails}>
            <div style={styles.networkName}>{network.name}</div>
            <div style={styles.networkMeta}>
              {network.fee && `Fee: ${network.fee} • `}
              {network.estimatedTime || '~10 min'}
            </div>
          </div>
        </div>

        <div style={styles.networkStatus}>
          <FaDotCircle style={styles.selectedIcon(isSelected)} />
        </div>
      </div>
    </div>
  );
});

const AddressDisplay: React.FC<{
  address: string;
  currency: string;
  onCopy: () => void;
  minimumDeposit?: number;
  confirmationCount?: number;
}> = React.memo(({ address, currency, onCopy, minimumDeposit, confirmationCount }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const containerStyle = isMobile ? styles.mobileLayout : styles.depositSection;

  return (
    <div style={containerStyle}>
      <div style={isMobile ? styles.mobileQrContainer : {}}>
        <div style={styles.qrContainer}>
          <QRCodeSVG 
            value={address} 
            size={isMobile ? 200 : 240}
            bgColor="transparent"
            fgColor="#000000"
            level="M"
            includeMargin={true}
          />
        </div>
      </div>

      <div style={styles.addressSection}>
        <h3 style={styles.addressTitle}>
          <FaWallet style={{ marginRight: '8px' }} />
          {t('Your Deposit Address')}
        </h3>

        <div style={styles.addressInputContainer}>
          <input
            type="text"
            value={address}
            onFocus={handleFocus}
            readOnly
            style={styles.addressInput}
            placeholder={t('Loading address...')}
          />
          <BFGradientButton
            buttonType={BFGradientButtonType.GoldenBorder}
            text={t('COPY')}
            onPress={onCopy}
            width="120px"
          />
        </div>

        {minimumDeposit && (
          <div style={styles.warningBox}>
            <FaExclamationTriangle />
            <span style={styles.warningText}>
              {t('Minimum Deposit')}: {minimumDeposit.toFixed(8)} {currency}
            </span>
          </div>
        )}

        <div style={styles.infoBox}>
          {confirmationCount && (
            <div style={styles.infoItem}>
              <FaClock style={styles.infoIcon} />
              {t('Deposit will proceed after {{count}} confirmations', { count: confirmationCount })}
            </div>
          )}
          
          <div style={styles.infoItem}>
            <FaShieldAlt style={styles.infoIcon} />
            {t('Double check address or use "Copy" button')}
          </div>
          
          <div style={styles.infoItem}>
            <FaExclamationTriangle style={styles.infoIcon} />
            {t('Wrong address may cause unrecoverable loss')}
          </div>
        </div>
      </div>
    </div>
  );
});

const LoadingScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  
  return (
    <div style={styles.loadingContainer}>
      {/* <LoadingScreen size={48} color={Colors.bitFlexGoldenColor} /> */}
      <div style={styles.loadingText}>{t('Loading deposit information...')}</div>
    </div>
  );
});

const GenerateAddressScreen: React.FC<{
  currencyName?: string;
  onGenerate: () => void;
  isLoading: boolean;
}> = React.memo(({ currencyName, onGenerate, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div style={styles.generateContainer}>
      <FaWallet style={styles.generateIcon} />
      
      <h2 style={styles.generateTitle}>
        {t('Generate Deposit Address')}
      </h2>
      
      <p style={styles.generateDescription}>
        {t('We will generate a unique deposit address for')} {' '}
        <span style={styles.currencyHighlight}>{currencyName}</span>.{' '}
        {t('This address is permanent and generated only once. Please double-check your input when sending funds, as wrong addresses may result in complete loss of coins.')}
      </p>

      <BFGradientButton
        isLoading={isLoading}
        buttonType={BFGradientButtonType.Action}
        width="300px"
        text={t('Agree & Generate Address')}
        onPress={onGenerate}
      />
    </div>
  );
});

// ====================================================================================
// MAIN COMPONENT
// ====================================================================================

export const DepositModal: React.FC<DepositModalProps> = ({ currency, onClose }) => {
  const { t } = useTranslation();
  const { state: { currencies } } = React.useContext(Store);
  const notificationRef = useRef<IBFNotification>(null);

  // State
  const [depositData, setDepositData] = useState<GetAddressResponse | null>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Memoized values
  const currencyData = useMemo(() => 
    currencies.find(c => c.symbol === currency),
    [currencies, currency]
  );

  const selectedNetwork = useMemo(() => 
    depositData?.networkCurrencies?.find(n => n.networkCurrencyId === selectedNetworkId),
    [depositData, selectedNetworkId]
  );

  const hasMultipleNetworks = useMemo(() => 
    (depositData?.networkCurrencies?.length || 0) > 1,
    [depositData]
  );

  // Auto-select first network if only one available
  useEffect(() => {
    if (depositData?.networkCurrencies?.length === 1 && selectedNetworkId === 0) {
      setSelectedNetworkId(depositData.networkCurrencies[0].networkCurrencyId!);
    }
  }, [depositData, selectedNetworkId]);

  // Load deposit data
  useEffect(() => {
    if (!currency) return;

    setIsLoading(true);
    
    BitflexOpenApi.BalanceApi.apiVversionBalanceDepositCurrencyAddressGet(currency, "1.0")
      .then(response => {
        setDepositData(response.data);
      })
      .catch(error => {
        console.error('Failed to load deposit data:', error);
        notificationRef.current?.Notify(
          t('Loading Error'),
          t('We are experiencing technical difficulties. Please try again later.'),
          BFNotificationType.Error
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currency, t]);

  // Handlers
  const handleGenerateAddress = useCallback(async () => {
    if (!currency) return;

    setIsGenerating(true);

    try {
      const response = await BitflexOpenApi.BalanceApi.apiVversionBalanceDepositCurrencyAddressPost(currency, "1.0");
      
      if (response.data.result && response.data.depositParam) {
        setDepositData(response.data.depositParam);
        notificationRef.current?.Notify(
          t('Success'),
          t('Deposit address generated successfully'),
          BFNotificationType.Success
        );
      } else {
        throw new Error('Address generation failed');
      }
    } catch (error) {
      console.error('Failed to generate address:', error);
      notificationRef.current?.Notify(
        t('Generation Error'),
        t('We are experiencing technical issues with {{currency}} wallet. Please try again in 15 minutes.', { 
          currency: currencyData?.name 
        }),
        BFNotificationType.Error
      );
    } finally {
      setIsGenerating(false);
    }
  }, [currency, currencyData?.name, t]);

  const handleCopyAddress = useCallback(() => {
    const address = hasMultipleNetworks ? selectedNetwork?.adreess : depositData?.address;
    
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        notificationRef.current?.Notify(
          t('Success'),
          t('Address copied to clipboard'),
          BFNotificationType.Success
        );
      }).catch(() => {
        notificationRef.current?.Notify(
          t('Error'),
          t('Failed to copy address'),
          BFNotificationType.Error
        );
      });
    }
  }, [hasMultipleNetworks, selectedNetwork, depositData, t]);

  const handleNetworkSelect = useCallback((networkId: number) => {
    setSelectedNetworkId(networkId);
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <BFNotification ref={notificationRef} />
        <LoadingScreen />
      </div>
    );
  }

  // Render address generation screen
  if (!depositData?.isAddressGenerated) {
    return (
      <div style={styles.container}>
        <BFNotification ref={notificationRef} />
        <GenerateAddressScreen
          currencyName={currencyData?.name}
          onGenerate={handleGenerateAddress}
          isLoading={isGenerating}
        />
      </div>
    );
  }

  // Render main deposit screen
  return (
    <div style={styles.container}>
      <BFNotification ref={notificationRef} />

      {hasMultipleNetworks && (
        <div style={styles.networkSection}>
          <h3 style={styles.networkTitle}>
            <FaDotCircle style={styles.infoIcon} />
            {t('Select Network')}
          </h3>
          
          {depositData.networkCurrencies?.map((network, index) => (
            <NetworkSelector
              key={network.networkCurrencyId}
              isSelected={selectedNetworkId === network.networkCurrencyId}
              onSelect={() => handleNetworkSelect(network.networkCurrencyId!)}
              network={network}
              isRecommended={index === 0} // First network is recommended
            />
          ))}
        </div>
      )}

      {(selectedNetworkId > 0 || !hasMultipleNetworks) && (
        <AddressDisplay
          address={hasMultipleNetworks ? selectedNetwork?.adreess! : depositData.address!}
          currency={depositData.currency!}
          onCopy={handleCopyAddress}
          minimumDeposit={depositData.minimumDeposit}
          confirmationCount={depositData.confirmationCount}
        />
      )}
    </div>
  );
};

export default DepositModal;