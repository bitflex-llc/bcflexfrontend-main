import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { FaCheck, FaLock, FaCheckCircle } from 'react-icons/fa';

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
import { signInStyles } from './styles';

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

const validateEmail = (email: string): boolean => {
  const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  return tester.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const RememberDeviceCheckbox = React.memo<{
  isChecked: boolean;
  onToggle: () => void;
  text: string;
}>(({ isChecked, onToggle, text }) => (
  <div style={signInStyles.checkboxContainer} onClick={onToggle}>
    <div style={signInStyles.checkboxBox(isChecked)}>
      <div style={signInStyles.checkboxText}>{text}</div>
      <FaCheck style={signInStyles.checkboxIcon(isChecked)} />
    </div>
  </div>
));

const SecurityBadge = React.memo(() => (
  <div style={signInStyles.securityBadgeContainer}>
    <p style={signInStyles.securityBadgeText}>Ensure that you are visiting bcflex.com</p>
    <div style={signInStyles.securityBadgeBox}>
      <FaLock color={Colors.bitFlexGreenColor} size={13} />
      <span style={signInStyles.securityBadgeUrl}>
        <span style={signInStyles.httpsText}>https://</span>
        bcflex.com
      </span>
    </div>
  </div>
));

const CustomInput = React.memo<{
  type: 'email' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isError: boolean;
  errorText?: string;
  isValid?: boolean;
}>(({ type, placeholder, value, onChange, isError, errorText, isValid }) => {
  const [showError, setShowError] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false);

  useEffect(() => {
    if (isError) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [isError]);

  const handleBlur = () => {
    setHasBlurred(true);
    if (type === 'email' && value && !validateEmail(value)) {
      setShowError(true);
    } else if (type === 'password' && value && !validatePassword(value)) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (showError || hasBlurred) {
      if (type === 'email' && newValue && !validateEmail(newValue)) {
        setShowError(true);
      } else if (type === 'password' && newValue && !validatePassword(newValue)) {
        setShowError(true);
      } else {
        setShowError(false);
      }
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 40px 12px 12px',
    backgroundColor: Colors.TextInput || '#2D2D2D',
    border: `1px solid ${showError ? Colors.bitFlexRedColor : Colors.BITFLEXBorderTerminal || '#433C3C'}`,
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box' as const,
    fontFamily: 'Roboto Condensed' 
  };

  const containerStyle = {
    position: 'relative' as const,
    width: '100%'
  };

  const iconStyle = {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const
  };

  const errorStyle = {
    position: 'absolute' as const,
    top: '-40px',
    left: '11%',
    backgroundColor: Colors.bitFlexRedColor,
    color: 'white',
    padding: '6px',
    borderRadius: '3px',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
    zIndex: 10
  };

  return (
    <div style={containerStyle}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        style={inputStyle}
        autoComplete="off"
        autoCorrect="off"
      />
      
      {isValid && !showError && value && (
        <div style={iconStyle}>
          <FaCheckCircle size={13} color={Colors.bitFlexGreenColor} />
        </div>
      )}
      
      {showError && errorText && (
        <div style={errorStyle}>
          {errorText}
        </div>
      )}
    </div>
  );
});

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

  const [ui, setUi] = useState({
    isFault: false,
    requireTfa: false,
    isLoading: false,
    rememberDevice: false,
    showResendModal: false,
    isResendLoading: false
  });

  const [twoStepVerificationType, setTwoStepVerificationType] = useState<TwoStepVerificationTypes>();
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const updateFormData = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear fault state when user starts typing
    setUi(prev => prev.isFault ? { ...prev, isFault: false } : prev);
    
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
  }, [t]);

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
  }, [formData, ui, bitflexDeviceId, getRecaptchaToken, handleSignInResponse, showNotification]);

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
      handleSubmit();
    }
  }, [handleSubmit]);

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

  return (
    <div className="body-login login" style={signInStyles.bodyLogin} id="maindiv">
      <div className="logo">
        <Link to="/terminal">
          <img src={BitflexLogo} alt="Bitflex Logo" width={isMobile ? '80%' : 350} />
        </Link>
      </div>

      <div className="content">
        <BFNotification ref={notificationRef} />

        <div className="box-login">
          <div id="stay-in-place" style={signInStyles.formTitleSpacing}>
            <h3 className="form-title"><Trans>Sign In</Trans></h3>

            <div className={!ui.requireTfa ? '' : 'app-hover-disabled'}>
              <SecurityBadge />

              <div style={signInStyles.fieldContainer}>
                <label><Trans>Email</Trans></label>
                <CustomInput
                  type="email"
                  placeholder={t('Email used at registration')}
                  value={formData.email}
                  onChange={(value) => updateFormData('email', value)}
                  isError={ui.isFault}
                  errorText={fieldErrors.email}
                  isValid={validation.isEmailValid}
                />
              </div>

              <div style={signInStyles.fieldContainerSpaced}>
                <label><Trans>Password</Trans></label>
                <CustomInput
                  type="password"
                  placeholder={t('Password')}
                  value={formData.password}
                  onChange={(value) => updateFormData('password', value)}
                  isError={ui.isFault}
                  errorText={fieldErrors.password}
                  isValid={validation.isPasswordValid}
                />
              </div>

              <div style={signInStyles.submitContainer}>
                <BFGradientButton
                  isDisabled={!validation.isEmailValid || !validation.isPasswordValid}
                  isLoading={ui.isLoading}
                  buttonType={BFGradientButtonType.Action}
                  text={t('Submit')}
                  onPress={handleSubmit}
                />
                <Link to="/signing/restore" className="dot">
                  Forgot Password?
                </Link>
              </div>

              <div className="create-acc">
                <p>
                  <Link to="/signup">
                    Don't Have an Account? <span style={{ color: '#cf8900' }}>Sign up</span>
                  </Link>
                </p>
              </div>
            </div>

            <div style={signInStyles.recaptchaContainer}>
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
              <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
            </div>
          </div>

          <div className={`${!ui.requireTfa ? 'app-hover-disabled' : 'app-hover-disabled app-hover-active'}`}>
            {ui.requireTfa && twoStepVerificationType === TwoStepVerificationTypes.Google && (
              <div style={signInStyles.twoFactorContainer}>
                <h3 className="form-title">Account Secured</h3>
                <p>Enter one-time-password from Authenticator App</p>
                <img src={bf_shield} width="25%" alt="Security Shield" />

                <div style={signInStyles.otpContainer}>
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

                <RememberDeviceCheckbox
                  isChecked={ui.rememberDevice}
                  onToggle={handleToggleRememberDevice}
                  text={t('Remember this device?')}
                />

                <BFGradientButton
                  buttonType={BFGradientButtonType.Action}
                  width="98%"
                  text={t('Confirm')}
                  onPress={handleTwoFactorSubmit}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={signInStyles.copyrightContainer}>
        <p className="neon">
          Flex Technologies Limited. 2021-{new Date().getFullYear()}
        </p>
      </div>

      {ui.showResendModal && (
        <BFModalWindow
          isOpen={ui.showResendModal}
          title={t('Email Not Confirmed')}
          onClose={handleCloseResendModal}
        >
          <div style={signInStyles.modalContent}>
            <p style={signInStyles.modalText}>
              <Trans>Your email address has not been confirmed yet. Would you like us to resend the confirmation email?</Trans>
            </p>
            <p style={signInStyles.modalEmailText}>
              <Trans>Email:</Trans> <span style={signInStyles.modalEmailValue}>{formData.email}</span>
            </p>

            <div style={signInStyles.modalButtonContainer}>
              <BFGradientButton
                buttonType={BFGradientButtonType.Destructive}
                text={t('Cancel')}
                onPress={handleCloseResendModal}
                width="120px"
              />
              <BFGradientButton
                buttonType={BFGradientButtonType.Action}
                text={t('Resend Email')}
                isLoading={ui.isResendLoading}
                onPress={handleResendEmailConfirmation}
                width="120px"
              />
            </div>
          </div>
        </BFModalWindow>
      )}
    </div>
  );
};

export default SignIn;