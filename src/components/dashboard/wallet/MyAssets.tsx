import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';

import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFModalWindow } from '../../html/BFModalWindow';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { DepositModal } from './deposit';
import { WithdrawModal } from './WithdrawModal';
import { DepositINRModal } from './depositinr';
import { WithdrawInr } from './withdrawInr';
// import NotificationSetup from './NotificationSetup';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { useBitflexDeviceId } from '../../../hooks/useBitflexDeviceId';
import { useCryptoKeys } from '../../../hooks/useCryptoKeys';

import { 
  GetApiMarketsCurrenciesResponse, 
  GetBalanceRequestModel 
} from '../../../api-wrapper';
import NotificationSetup from './NotificationSetup';

// ====================================================================================
// TYPES
// ====================================================================================

interface BalanceRowData {
  currency: string;
  name: string;
  available: number;
  image: string;
}

// ====================================================================================
// CONSTANTS
// ====================================================================================

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 30000,
  errorRetryCount: 3,
  errorRetryInterval: 5000
} as const;

// ====================================================================================
// FETCHERS
// ====================================================================================

const fetchBalances = async (): Promise<GetBalanceRequestModel[]> => {
  const response = await BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0");
  return response.data.balances || [];
};

const fetchCurrencies = async (): Promise<GetApiMarketsCurrenciesResponse[]> => {
  const response = await BitflexOpenApi.MarketsApi.apiVversionMarketsCurrenciesGet("1.0");
  const currencies = response.data || [];
  
  try {
    localStorage.setItem('currencies', JSON.stringify(currencies));
  } catch (error) {
    console.warn('Failed to cache currencies:', error);
  }
  
  return currencies;
};

// ====================================================================================
// COMPONENTS
// ====================================================================================

const BalanceRow: React.FC<{
  balance: BalanceRowData;
  onDeposit: (currency: string) => void;
  onWithdraw: (currency: string) => void;
}> = React.memo(({ balance, onDeposit, onWithdraw }) => {
  const { t } = useTranslation();

  const handleDeposit = useCallback(() => {
    onDeposit(balance.currency);
  }, [balance.currency, onDeposit]);

  const handleWithdraw = useCallback(() => {
    onWithdraw(balance.currency);
  }, [balance.currency, onWithdraw]);

  return (
    <tr style={{ fontSize: 12, height: 30, alignItems: 'center' }}>
      <td className="tdFix tdFix-left">
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <img 
            alt={balance.currency}
            style={{ maxHeight: 18, marginTop: 4, marginRight: 5 }}
            src={balance.image}
            loading="lazy"
          />
          <div>
            {!isMobile && `${balance.name} | `}
            {balance.currency}
          </div>
        </div>
      </td>
      
      <td className="tdFix">
        {balance.available.toFixed(4)}
      </td>
      
      <td 
        className="tdFix"
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          textAlign: 'center',
          width: isMobile ? '100%' : '95%',
          placeContent: 'space-evenly'
        }}
      >
        <BFGradientButton
          text={t('Deposit')}
          buttonType={isMobile ? BFGradientButtonType.GoldenBorderActionSmall : BFGradientButtonType.GoldenBorder}
          width={isMobile ? 'unset' : 95}
          onPress={handleDeposit}
        />
        
        <BFGradientButton
          text={t('Withdraw')}
          buttonType={isMobile ? BFGradientButtonType.GoldenBorderActionSmall : BFGradientButtonType.GoldenBorder}
          width={isMobile ? 'unset' : 95}
          onPress={handleWithdraw}
        />
      </td>
    </tr>
  );
});

const BalanceTable: React.FC<{
  data: BalanceRowData[];
  onDeposit: (currency: string) => void;
  onWithdraw: (currency: string) => void;
}> = React.memo(({ data, onDeposit, onWithdraw }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="table table-striped" style={{ overflow: 'scroll' }}>
      <thead>
        <tr>
          <th className="thFix stickyHeader tdFix-left noborder">
            {!isMobile ? "Coin / Token / Asset" : "Currency"}
          </th>
          <th className="thFix stickyHeader noborder">Available</th>
          <th className="thFix stickyHeader noborder">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((balance) => (
          <BalanceRow
            key={balance.currency}
            balance={balance}
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
          />
        ))}
      </tbody>
    </table>
  </div>
));

// ====================================================================================
// MAIN COMPONENT
// ====================================================================================

const MyAssets: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { bitflexDeviceId } = useBitflexDeviceId();
  const { publicKey } = useCryptoKeys();

  // Modal states
  const [depositModal, setDepositModal] = useState<{
    isOpen: boolean;
    currency?: string;
  }>({ isOpen: false });

  const [withdrawModal, setWithdrawModal] = useState<{
    isOpen: boolean;
    currency?: string;
  }>({ isOpen: false });

  const [showNotificationSetup, setShowNotificationSetup] = useState(false);

  // SWR hooks for data fetching
  const { 
    data: balances = [], 
    isLoading: balancesLoading,
    mutate: mutateBalances 
  } = useSWR('balances', fetchBalances, SWR_CONFIG);

  const { 
    data: currencies = [], 
    isLoading: currenciesLoading 
  } = useSWR('currencies', fetchCurrencies, SWR_CONFIG);

  // Computed data
  const balanceData = useMemo((): BalanceRowData[] => {
    if (!balances.length || !currencies.length) return [];

    return balances
      .map(balance => {
        const currency = currencies.find(c => c.symbol === balance.currency);
        if (!currency) return null;

        return {
          currency: balance.currency!,
          name: currency.name!,
          available: balance.available || 0,
          image: currency.imageBase64!
        };
      })
      .filter((item): item is BalanceRowData => item !== null);
  }, [balances, currencies]);

  // Check if we need to show notification setup
  useEffect(() => {
    // const shouldShowSetup = location.state?.requireSetPush && publicKey && bitflexDeviceId;
    // setShowNotificationSetup(!!shouldShowSetup);
  }, [location.state, publicKey, bitflexDeviceId]);

  // Event handlers
  const handleOpenDeposit = useCallback((currency: string) => {
    setDepositModal({ isOpen: true, currency });
  }, []);

  const handleCloseDeposit = useCallback(() => {
    setDepositModal({ isOpen: false });
    setTimeout(() => setDepositModal({ isOpen: false, currency: undefined }), 100);
  }, []);

  const handleOpenWithdraw = useCallback((currency: string) => {
    setWithdrawModal({ isOpen: true, currency });
  }, []);

  const handleCloseWithdraw = useCallback(() => {
    setWithdrawModal({ isOpen: false });
    setTimeout(() => {
      setWithdrawModal({ isOpen: false, currency: undefined });
      mutateBalances();
    }, 100);
  }, [mutateBalances]);

  const handleNotificationSuccess = useCallback(() => {
    setShowNotificationSetup(false);
    // Could show a success message here
  }, []);

  const handleNotificationError = useCallback((error: string) => {
    console.error('Notification setup error:', error);
    // Could show an error message here
  }, []);

  const isLoading = balancesLoading || currenciesLoading;

  return (
    <StaticPagesLayout isDashboard={true} isLoading={isLoading}>
      <>
        {/* Notification Setup */}
        {/* {showNotificationSetup && (
          <NotificationSetup
            bitflexDeviceId={bitflexDeviceId}
            publicKey={publicKey}
            onSuccess={handleNotificationSuccess}
            onError={handleNotificationError}
          />
        )} */}

        {/* Deposit Modal */}
        <BFModalWindow
          title={`Deposit ${depositModal.currency || ''}`}
          isOpen={depositModal.isOpen}
          onClose={handleCloseDeposit}
        >
          {depositModal.currency === "INR" ? (
            <DepositINRModal
              currency={depositModal.currency}
              onClose={handleCloseDeposit}
            />
          ) : (
            <DepositModal
              currency={depositModal.currency!}
              onClose={handleCloseDeposit}
            />
          )}
        </BFModalWindow>

        {/* Withdraw Modal */}
        <BFModalWindow
          title={`Withdraw ${withdrawModal.currency || ''}`}
          keepBlurred={true}
          isOpen={withdrawModal.isOpen}
          onClose={handleCloseWithdraw}
        >
          {withdrawModal.currency === "INR" ? (
            <WithdrawInr
              currency={withdrawModal.currency}
              onClose={handleCloseWithdraw}
            />
          ) : (
            <WithdrawModal
              currency={withdrawModal.currency!}
              onClose={handleCloseWithdraw}
            />
          )}
        </BFModalWindow>

        {/* Main Content */}
        <div className="bf-dash-header">
          <h1 className="bf-dashboard-title">My Assets</h1>
        </div>

        {balanceData.length > 0 ? (
          <BalanceTable
            data={balanceData}
            onDeposit={handleOpenDeposit}
            onWithdraw={handleOpenWithdraw}
          />
        ) : !isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            {t('No assets found')}
          </div>
        ) : null}
      </>
    </StaticPagesLayout>
  );
};

export default MyAssets;