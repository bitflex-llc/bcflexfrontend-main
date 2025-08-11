import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { FaCheck, FaLock, FaCheckCircle, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { BFModalWindow } from '../html/BFModalWindow';
import OTPInput from '../html/BFOTPInput';

import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import { useCryptoKeys } from '../../hooks/useCryptoKeys';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';

import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { SignInResponseResult, TwoStepVerificationTypes } from '../../api-wrapper';

import BitflexLogo from '../../images/bitflex-logo.svg';
import bf_shield from '../../images/shield.svg';
import Colors from '../../Colors';
import '../../css/signlayout.css';

// ====================================================================================
// TYPES & INTERFACES
// ====================================================================================

interface FormData {
  email: string;
  password: string;
  otp: string;
}

interface ValidationState {
  isEmailValid: boolean;
  isPasswordValid: boolean;
}

interface FieldErrors {
  email: string;
  password: string;
}

interface UIState {
  isFault: boolean;
  requireTfa: boolean;
  isLoading: boolean;
  rememberDevice: boolean;
  showResendModal: boolean;
  isResendLoading: boolean;
}

// ====================================================================================
// SHADCN-INSPIRED STYLES
// ====================================================================================

const shadcnStyles = {
  // Layout & Container Styles
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    // background: 'linear-gradient(135deg, hsl(222.2, 84%, 4.9%) 0%, hsl(217.2, 32.6%, 17.5%) 100%)',
    padding: '24px',
    position: 'relative' as const
  },
  
  // Logo Section
  logoContainer: {

    textAlign: 'center' as const
  },
  
  // Main Card Styles
  card: {
    // background: 'hsl(222.2, 84%, 4.9%)',
    border: '1px dashed #433C3C',
    borderRadius: '25px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    backdropFilter: 'blur(8px)',
    position: 'relative' as const
  },
  
  cardHeader: {
    textAlign: 'center' as const,
    marginBottom: '20px'
  },
  
  cardTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'hsl(210, 40%, 98%)',
    marginBottom: '8px',
    letterSpacing: '-0.025em',
    marginTop: '0'
  },
  
  cardDescription: {
    fontSize: '14px',
    color: 'hsl(215, 20.2%, 65.1%)',
    lineHeight: '1.5'
  },
  
  // Form Styles
  formContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px'
  },
  
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'hsl(210, 40%, 98%)',
    marginBottom: '8px'
  },
  
  // Input Styles (Shadcn-inspired)
  inputContainer: {
    position: 'relative' as const,
    width: '100%'
  },
  
  input: (hasError: boolean, isValid: boolean, showPassword?: boolean) => ({
    width: '100%',
    height: '44px',
    padding:  '0 20px 0 20px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: 'hsl(210, 40%, 98%)',
    background: 'hsl(222.2, 84%, 4.9%)',
    border: `1px solid ${hasError ? 'hsl(0, 84.2%, 60.2%)' : 'hsl(217.2, 32.6%, 17.5%)'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    boxSizing: 'border-box' as const,
    '&:focus': {
      borderColor: hasError ? 'hsl(0, 84.2%, 60.2%)' : 'hsl(217.2, 91.2%, 59.8%)',
      boxShadow: hasError 
        ? '0 0 0 2px hsl(0, 84.2%, 60.2%, 0.2)' 
        : '0 0 0 2px hsl(217.2, 91.2%, 59.8%, 0.2)'
    }
  }),
  
  inputIcon: {
    position: 'absolute' as const,
    // left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'hsl(215, 20.2%, 65.1%)',
    fontSize: '16px',
    pointerEvents: 'none' as const
  },
  
  inputRightIcon: (clickable: boolean = false) => ({
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'hsl(215, 20.2%, 65.1%)',
    fontSize: '16px',
    cursor: clickable ? 'pointer' : 'default',
    pointerEvents: clickable ? 'auto' as const : 'none' as const,
    transition: 'color 0.2s ease'
  }),
  
  validIcon: {
    color: 'hsl(142.1, 76.2%, 36.3%)'
  },
  
  errorIcon: {
    color: 'hsl(0, 84.2%, 60.2%)'
  },
  
  // Error Message Styles
  errorMessage: {
    fontSize: '12px',
    color: 'hsl(0, 84.2%, 60.2%)',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  // Security Badge Styles
  securityBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    marginBottom: '24px',
    background: 'hsl(142.1, 76.2%, 36.3%, 0.1)',
    border: '1px solid hsl(142.1, 76.2%, 36.3%, 0.2)',
    borderRadius: '8px'
  },
  
  securityText: {
    fontSize: '12px',
    color: 'hsl(142.1, 76.2%, 36.3%)',
    textAlign: 'center' as const,
    margin: '0'
  },
  
  securityUrl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: 'hsl(142.1, 76.2%, 36.3%)'
  },
  
  httpsText: {
    color: 'hsl(142.1, 76.2%, 36.3%)',
    fontWeight: '600'
  },
  
  // Button Styles
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '8px'
  },
  
  button: (variant: 'primary' | 'secondary' = 'primary', isLoading: boolean = false) => ({
    width: '100%',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...(variant === 'primary' ? {
      background:  Colors.bitFlexGoldenColor,
      color: 'hsl(210, 40%, 98%)',
      '&:hover': {
        background: 'hsl(217.2, 91.2%, 54.8%)'
      },
      '&:focus': {
        boxShadow: '0 0 0 2px hsl(217.2, 91.2%, 59.8%, 0.4)'
      }
    } : {
      background: 'transparent',
      color: 'hsl(210, 40%, 98%)',
      border: '1px solid hsl(217.2, 32.6%, 17.5%)',
      '&:hover': {
        background: 'hsl(217.2, 32.6%, 17.5%)'
      }
    })
  }),
  
  // Checkbox Styles
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '8px 0'
  },
  
  checkbox: (isChecked: boolean) => ({
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: `1px solid ${isChecked ? 'hsl(217.2, 91.2%, 59.8%)' : 'hsl(217.2, 32.6%, 17.5%)'}`,
    background: isChecked ? 'hsl(217.2, 91.2%, 59.8%)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }),
  
  checkboxLabel: {
    fontSize: '14px',
    color: 'hsl(215, 20.2%, 65.1%)',
    userSelect: 'none' as const
  },
  
  // Links
  link: {
    color: 'hsl(217.2, 91.2%, 59.8%)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: 'hsl(217.2, 91.2%, 54.8%)',
      textDecoration: 'underline'
    }
  },
  
  linkContainer: {
    textAlign: 'center' as const,
    marginTop: '16px'
  },
  
  // Two Factor Authentication Styles
  tfaContainer: {
    textAlign: 'center' as const,
    padding: '32px',
    background: 'hsl(222.2, 84%, 4.9%)',
    border: '1px solid hsl(217.2, 32.6%, 17.5%)',
    borderRadius: '12px',
    marginTop: '24px'
  },
  
  tfaTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'hsl(210, 40%, 98%)',
    marginBottom: '8px'
  },
  
  tfaDescription: {
    fontSize: '14px',
    color: 'hsl(215, 20.2%, 65.1%)',
    marginBottom: '24px'
  },
  
  tfaShield: {
    marginBottom: '24px',
    opacity: 0.8
  },
  
  // OTP Input Styles
  otpContainer: {
    margin: '24px 0',
    display: 'flex',
    justifyContent: 'center'
  },
  
  // Modal Styles
  modalContent: {
    padding: '24px',
    textAlign: 'center' as const
  },
  
  modalText: {
    fontSize: '14px',
    color: 'hsl(215, 20.2%, 65.1%)',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  
  modalEmail: {
    fontSize: '14px',
    color: 'hsl(210, 40%, 98%)',
    marginBottom: '24px'
  },
  
  modalEmailValue: {
    color: 'hsl(217.2, 91.2%, 59.8%)',
    fontWeight: '500'
  },
  
  modalButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  
  // Copyright
  copyright: {
    position: 'absolute' as const,
    bottom: '24px',
    textAlign: 'center' as const,
    fontSize: '12px',
    color: 'hsl(215, 20.2%, 65.1%)',
    opacity: 0.8
  },
  
  // reCAPTCHA
  recaptchaText: {
    fontSize: '11px',
    color: 'hsl(215, 20.2%, 65.1%)',
    textAlign: 'center' as const,
    marginTop: '16px',
    lineHeight: '1.4'
  },
  
  // Mobile Responsive
  mobile: {
    card: {
      margin: '16px',
      padding: '24px',
      maxWidth: 'calc(100vw - 32px)'
    },
    input: {
      fontSize: '16px' // Prevent zoom on iOS
    }
  }
};

// ====================================================================================
// VALIDATION FUNCTIONS
// ====================================================================================

const validateEmail = (email: string): boolean => {
  const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  return tester.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

// ====================================================================================
// SUB-COMPONENTS
// ====================================================================================

/**
 * Security Badge Component - Shows HTTPS verification
 */
const SecurityBadge: React.FC = React.memo(() => {
  const { t } = useTranslation();
  
  return (
    <div style={shadcnStyles.securityBadge}>
      <p style={shadcnStyles.securityText}>
        {t('Ensure that you are visiting bcflex.com')}
      </p>
      <div style={shadcnStyles.securityUrl}>
        <FaLock size={12} />
        <span>
          <span style={shadcnStyles.httpsText}>https://</span>
          bcflex.com
        </span>
      </div>
    </div>
  );
});

/**
 * Enhanced Input Component with Shadcn-style design
 */
const EnhancedInput: React.FC<{
  type: 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isError: boolean;
  errorText?: string;
  isValid?: boolean;
  disabled?: boolean;
}> = React.memo(({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  isError, 
  errorText, 
  isValid = false,
  disabled = false 
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Real-time validation after first blur
    if (hasBlurred && newValue) {
      if (type === 'email' && !validateEmail(newValue)) {
        setLocalError(t('Please enter a valid email address'));
      } else if (type === 'password' && !validatePassword(newValue)) {
        setLocalError(t('Password must be at least 8 characters'));
      } else {
        setLocalError('');
      }
    } else if (!newValue) {
      setLocalError('');
    }
  }, [onChange, type, hasBlurred, t]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasBlurred(true);
    
    if (value) {
      if (type === 'email' && !validateEmail(value)) {
        setLocalError(t('Please enter a valid email address'));
      } else if (type === 'password' && !validatePassword(value)) {
        setLocalError(t('Password must be at least 8 characters'));
      } else {
        setLocalError('');
      }
    }
  }, [value, type, t]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const hasError = isError || !!localError;
  const errorMessage = errorText || localError;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div style={shadcnStyles.inputContainer}>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={{
          ...shadcnStyles.input(hasError, isValid && !hasError, type === 'password'),
          ...(isFocused && !hasError ? {
            borderColor: 'hsl(217.2, 91.2%, 59.8%)',
            boxShadow: '0 0 0 2px hsl(217.2, 91.2%, 59.8%, 0.2)'
          } : {}),
          ...(isMobile ? shadcnStyles.mobile.input : {})
        }}
        autoComplete={type === 'email' ? 'email' : 'current-password'}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />
      
      {type === 'password' && (
        <div 
          style={shadcnStyles.inputRightIcon(true)}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
      )}
      
      {type === 'email' && isValid && !hasError && value && (
        <div style={{ ...shadcnStyles.inputRightIcon(), ...shadcnStyles.validIcon }}>
          <FaCheckCircle />
        </div>
      )}
      
      {/* Error Message */}
      {hasError && errorMessage && (
        <div style={shadcnStyles.errorMessage}>
          <span>⚠</span>
          {errorMessage}
        </div>
      )}
    </div>
  );
});

/**
 * Enhanced Checkbox Component
 */
const EnhancedCheckbox: React.FC<{
  isChecked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}> = React.memo(({ isChecked, onToggle, label, disabled = false }) => (
  <div 
    style={{
      ...shadcnStyles.checkboxContainer,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}
    onClick={disabled ? undefined : onToggle}
  >
    <div style={shadcnStyles.checkbox(isChecked)}>
      {isChecked && <FaCheck size={10} color="white" />}
    </div>
    <span style={shadcnStyles.checkboxLabel}>{label}</span>
  </div>
));

// ====================================================================================
// MAIN COMPONENT
// ====================================================================================

const SignIn: React.FC = () => {
  const { setSignIn } = useUserState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { Onweb_2step_confirmed } = useSignalR();
  const { LoadKeys } = useCryptoKeys();
  const { bitflexDeviceId } = useBitflexDeviceId();

  const notificationRef = useRef<IBFNotification>(null);
  const submitInProgressRef = useRef(false);

  // State Management
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    otp: ''
  });

  const [validation, setValidation] = useState<ValidationState>({
    isEmailValid: false,
    isPasswordValid: false
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    email: '',
    password: ''
  });

  const [ui, setUi] = useState<UIState>({
    isFault: false,
    requireTfa: false,
    isLoading: false,
    rememberDevice: false,
    showResendModal: false,
    isResendLoading: false
  });

  const [twoStepVerificationType, setTwoStepVerificationType] = useState<TwoStepVerificationTypes>();
  const [recaptchaToken, setRecaptchaToken] = useState('');

  // ====================================================================================
  // HANDLERS & CALLBACKS
  // ====================================================================================

  const updateFormData = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear fault state when user starts typing
    if (ui.isFault) {
      setUi(prev => ({ ...prev, isFault: false }));
    }
    
    // Update validation
    if (field === 'email') {
      const isValid = validateEmail(value);
      setValidation(prev => ({ ...prev, isEmailValid: isValid }));
      setFieldErrors(prev => ({ 
        ...prev, 
        email: !isValid && value ? t('Invalid Email format') : '' 
      }));
    } else if (field === 'password') {
      const isValid = validatePassword(value);
      setValidation(prev => ({ ...prev, isPasswordValid: isValid }));
      setFieldErrors(prev => ({ 
        ...prev, 
        password: !isValid && value ? t('Invalid Password Length. Minimum 8 characters') : '' 
      }));
    }
  }, [ui.isFault, t]);

  const showNotification = useCallback((title: string, message: string, type: BFNotificationType) => {
    notificationRef.current?.Notify(t(title), t(message), type);
  }, [t]);

  const getRecaptchaToken = useCallback(async (): Promise<string> => {
    if (executeRecaptcha) {
      const token = await executeRecaptcha("login_page");
      setRecaptchaToken(token);
      return token;
    }
    return recaptchaToken;
  }, [executeRecaptcha, recaptchaToken]);

  const handleResendEmailConfirmation = useCallback(async () => {
    if (!formData.email) {
      showNotification('Error', 'Email is required', BFNotificationType.Error);
      return;
    }

    setUi(prev => ({ ...prev, isResendLoading: true }));

    try {
      const response = await BitflexOpenApi.SignApi.apiVversionSignResendemailconfirmationPost("1.0", {
        email: formData.email
      });

      if (response.data.success) {
        showNotification('Success', 'Email confirmation sent successfully', BFNotificationType.Success);
        setUi(prev => ({ ...prev, showResendModal: false }));
      } else {
        showNotification('Error', 'Failed to send email confirmation', BFNotificationType.Error);
      }
    } catch (error) {
      showNotification('Error', 'Error sending email confirmation. Please try again later', BFNotificationType.Error);
    } finally {
      setUi(prev => ({ ...prev, isResendLoading: false }));
    }
  }, [formData.email, showNotification]);

  const handleSignInResponse = useCallback((result: any) => {
    switch (result.data.result) {
      case SignInResponseResult.ReCaptchav3Failed:
        showNotification('Error', 'ReCaptcha failed, try again', BFNotificationType.Error);
        window.location.reload();
        break;

      case SignInResponseResult.Success:
        if (result.data.authToken) {
          BitflexOpenApi.Init(result.data.authToken);

          if (result.data.email) {
            localStorage.setItem("obfuscatedEmail", result.data.email);
          }

          if (result.data.rememberDeviceToken && ui.rememberDevice) {
            localStorage.setItem("rememberDeviceId", result.data.rememberDeviceToken);
          }

          setSignIn(result.data.authToken, result.data.expiryTimestamp);
          navigate('/wallet/assets', { state: { requireSetPush: true } });
        } else {
          showNotification('Error', 'Error on server side. Try again later', BFNotificationType.Error);
        }
        break;

      case SignInResponseResult.WrongCredentials:
      case SignInResponseResult.WrongPassword:
        showNotification('Error', 'Invalid email and/or password', BFNotificationType.Error);
        setUi(prev => ({ ...prev, isFault: true }));
        break;

      case SignInResponseResult.EmailNotConfirmed:
        setUi(prev => ({ ...prev, showResendModal: true }));
        break;

      case SignInResponseResult.RequireTwoFactor:
        showNotification('Two Step Verification', 'Please complete two step verification', BFNotificationType.Warning);
        setUi(prev => ({ ...prev, requireTfa: true }));
        setTwoStepVerificationType(result.data.twoFactorType);
        break;

      case SignInResponseResult.BitflexDeviceIdIsNotPresent:
        showNotification('Error', 'BCFLEX device generation Error, try to clear cache', BFNotificationType.Error);
        break;

      case SignInResponseResult.GoogleTfaWrong:
        showNotification('Error', 'Wrong Code', BFNotificationType.Error);
        break;

      default:
        showNotification('Error', 'Unknown error occurred', BFNotificationType.Error);
    }
  }, [navigate, setSignIn, ui.rememberDevice, showNotification]);

  const handleSubmit = useCallback(async () => {
    if (submitInProgressRef.current) return;

    if (!formData.email || !formData.password) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }

    if (!validation.isEmailValid || !validation.isPasswordValid) {
      showNotification('Error', 'Please correct the errors before submitting', BFNotificationType.Error);
      return;
    }

    submitInProgressRef.current = true;
    setUi(prev => ({ ...prev, isLoading: true }));

    try {
      const token = await getRecaptchaToken();

      const response = await BitflexOpenApi.SignApi.apiVversionSignSigninPost("1.0", {
        email: formData.email,
        password: formData.password,
        reCaptchav3Token: token,
        bitflexDeviceId: bitflexDeviceId,
        rememberedDeviceToken: localStorage.getItem("rememberDeviceId"),
        ...(ui.requireTfa && formData.otp && {
          googleTfaCode: formData.otp,
          rememberDevice: ui.rememberDevice
        })
      });

      handleSignInResponse(response);
    } catch (error) {
      showNotification('Error', 'Account is locked or unrecognized error appear. Contact support Telegram: @bitflex_exchange', BFNotificationType.Error);
    } finally {
      setUi(prev => ({ ...prev, isLoading: false }));
      submitInProgressRef.current = false;
    }
  }, [formData, validation, ui, bitflexDeviceId, getRecaptchaToken, handleSignInResponse, showNotification]);

  const handleTwoFactorSubmit = useCallback(async () => {
    if (!formData.email || !formData.password || !formData.otp) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }
    await handleSubmit();
  }, [formData, handleSubmit, showNotification]);

  const handleCloseResendModal = useCallback(() => {
    setUi(prev => ({ ...prev, showResendModal: false }));
  }, []);

  const handleToggleRememberDevice = useCallback(() => {
    setUi(prev => ({ ...prev, rememberDevice: !prev.rememberDevice }));
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      event.preventDefault();
      if (ui.requireTfa) {
        handleTwoFactorSubmit();
      } else {
        handleSubmit();
      }
    }
  }, [handleSubmit, handleTwoFactorSubmit, ui.requireTfa]);

  // ====================================================================================
  // EFFECTS
  // ====================================================================================

  useEffect(() => {
    LoadKeys();

    Onweb_2step_confirmed((jwtToken, expiryTimestamp, obfuscatedEmail) => {
      localStorage.setItem("obfuscatedEmail", obfuscatedEmail);
      BitflexOpenApi.Init(jwtToken);
      setSignIn(jwtToken, expiryTimestamp);
      navigate('/wallet/assets');
    });
  }, [LoadKeys, Onweb_2step_confirmed, navigate, setSignIn]);

  useEffect(() => {
    if (executeRecaptcha) {
      executeRecaptcha("login_page").then(setRecaptchaToken);
    }
  }, [executeRecaptcha]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const isFormValid = validation.isEmailValid && validation.isPasswordValid;

  // ====================================================================================
  // RENDER
  // ====================================================================================

  return (
    <div style={shadcnStyles.pageContainer}>
      <BFNotification ref={notificationRef} />
      
      {/* Logo */}
      <div style={shadcnStyles.logoContainer}>
        <Link to="/terminal">
          <img 
            src={BitflexLogo} 
            alt="Bitflex Logo" 
            width={isMobile ? 200 : 300}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Link>
      </div>

      {/* Main Sign-In Card */}
      {!ui.requireTfa && (
        <div style={{ ...shadcnStyles.card, ...(isMobile ? shadcnStyles.mobile.card : {}) }}>
          <div style={shadcnStyles.cardHeader}>
            <h1 style={shadcnStyles.cardTitle}>
              <Trans>Welcome back</Trans>
            </h1>
            <p style={shadcnStyles.cardDescription}>
              <Trans>Enter your credentials to access your account</Trans>
            </p>
          </div>

          <SecurityBadge />

          <form 
            style={shadcnStyles.formContainer}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Email Field */}
            <div style={shadcnStyles.fieldGroup}>
              <label style={shadcnStyles.label}>
                <Trans>Email Address</Trans>
              </label>
              <EnhancedInput
                type="email"
                placeholder={t('Enter your email address')}
                value={formData.email}
                onChange={(value) => updateFormData('email', value)}
                isError={ui.isFault}
                errorText={fieldErrors.email}
                isValid={validation.isEmailValid}
                disabled={ui.isLoading}
              />
            </div>

            {/* Password Field */}
            <div style={shadcnStyles.fieldGroup}>
              <label style={shadcnStyles.label}>
                <Trans>Password</Trans>
              </label>
              <EnhancedInput
                type="password"
                placeholder={t('Enter your password')}
                value={formData.password}
                onChange={(value) => updateFormData('password', value)}
                isError={ui.isFault}
                errorText={fieldErrors.password}
                isValid={validation.isPasswordValid}
                disabled={ui.isLoading}
              />
            </div>

            {/* Submit Button */}
            <div style={shadcnStyles.buttonContainer}>
              <button
                type="submit"
                disabled={!isFormValid || ui.isLoading}
                style={{
                  ...shadcnStyles.button('primary', ui.isLoading),
                  opacity: (!isFormValid || ui.isLoading) ? 0.6 : 1
                }}
              >
                {ui.isLoading ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <Trans>Signing in...</Trans>
                  </>
                ) : (
                  <Trans>Sign In</Trans>
                )}
              </button>
              
              <div style={shadcnStyles.linkContainer}>
                <Link to="/signing/restore" style={shadcnStyles.link}>
                  <Trans>Forgot your password?</Trans>
                </Link>
              </div>
            </div>
          </form>

          <div style={shadcnStyles.linkContainer}>
            <p style={{ color: 'hsl(215, 20.2%, 65.1%)', fontSize: '14px', margin: '0' }}>
              <Trans>Don't have an account?</Trans>{' '}
              <Link to="/signup" style={shadcnStyles.link}>
                <Trans>Sign up</Trans>
              </Link>
            </p>
          </div>

          <div style={shadcnStyles.recaptchaText}>
            <Trans>This site is protected by reCAPTCHA and the Google</Trans>{' '}
            <a href="https://policies.google.com/privacy" style={shadcnStyles.link}>
              <Trans>Privacy Policy</Trans>
            </a>{' '}
            <Trans>and</Trans>{' '}
            <a href="https://policies.google.com/terms" style={shadcnStyles.link}>
              <Trans>Terms of Service</Trans>
            </a>{' '}
            <Trans>apply.</Trans>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Card */}
      {ui.requireTfa && twoStepVerificationType === TwoStepVerificationTypes.Google && (
        <div style={{ ...shadcnStyles.card, ...(isMobile ? shadcnStyles.mobile.card : {}) }}>
          <div style={shadcnStyles.cardHeader}>
            <div style={{ marginBottom: '16px' }}>
              <FaShieldAlt size={48} color="hsl(142.1, 76.2%, 36.3%)" />
            </div>
            <h1 style={shadcnStyles.cardTitle}>
              <Trans>Two-Factor Authentication</Trans>
            </h1>
            <p style={shadcnStyles.cardDescription}>
              <Trans>Enter the 6-digit code from your authenticator app</Trans>
            </p>
          </div>

          <div style={shadcnStyles.otpContainer}>
            <OTPInput
              autoFocus
              isNumberInput
              length={6}
              className="otpContainer"
              inputClassName="otpInput"
              onChangeOTP={(otp) => {
                if (otp.length === 6) {
                  updateFormData('otp', otp);
                }
              }}
            />
          </div>

          <EnhancedCheckbox
            isChecked={ui.rememberDevice}
            onToggle={handleToggleRememberDevice}
            label={t('Remember this device for 30 days')}
          />

          <div style={shadcnStyles.buttonContainer}>
            <button
              type="button"
              onClick={handleTwoFactorSubmit}
              disabled={formData.otp.length !== 6 || ui.isLoading}
              style={{
                ...shadcnStyles.button('primary', ui.isLoading),
                opacity: (formData.otp.length !== 6 || ui.isLoading) ? 0.6 : 1
              }}
            >
              {ui.isLoading ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <Trans>Verifying...</Trans>
                </>
              ) : (
                <Trans>Verify & Continue</Trans>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {ui.showResendModal && (
        <BFModalWindow
          isOpen={ui.showResendModal}
          title={t('Email Not Confirmed')}
          onClose={handleCloseResendModal}
        >
          <div style={shadcnStyles.modalContent}>
            <p style={shadcnStyles.modalText}>
              <Trans>Your email address has not been confirmed yet. Would you like us to resend the confirmation email?</Trans>
            </p>
            <p style={shadcnStyles.modalEmail}>
              <Trans>Email:</Trans>{' '}
              <span style={shadcnStyles.modalEmailValue}>{formData.email}</span>
            </p>

            <div style={shadcnStyles.modalButtons}>
              <button
                type="button"
                onClick={handleCloseResendModal}
                style={shadcnStyles.button('secondary')}
              >
                <Trans>Cancel</Trans>
              </button>
              <button
                type="button"
                onClick={handleResendEmailConfirmation}
                disabled={ui.isResendLoading}
                style={{
                  ...shadcnStyles.button('primary', ui.isResendLoading),
                  opacity: ui.isResendLoading ? 0.6 : 1
                }}
              >
                {ui.isResendLoading ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <Trans>Sending...</Trans>
                  </>
                ) : (
                  <Trans>Resend Email</Trans>
                )}
              </button>
            </div>
          </div>
        </BFModalWindow>
      )}

      {/* Copyright */}
      <div style={shadcnStyles.copyright}>
        <p>
          Flex Technologies Limited. 2021-{new Date().getFullYear()}
        </p>
      </div>

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none !important;
        }
        
        /* Custom scrollbar for mobile */
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;