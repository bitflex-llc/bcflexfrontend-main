import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import { FaCheck, FaLock } from 'react-icons/fa';

// Components
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { BFModalWindow } from '../html/BFModalWindow';
import OTPInput from '../html/BFOTPInput';

// Hooks
import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import { useCryptoKeys } from '../../hooks/useCryptoKeys';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';

// API & Types
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { SignInResponseResult, TwoStepVerificationTypes } from '../../api-wrapper';

// Assets & Styles
import BitflexLogo from '../../images/bitflex-logo.svg';
import bf_shield from '../../images/shield.svg';
import Colors from '../../Colors';
import '../../css/signlayout.css';

interface FormData {
  email: string;
  password: string;
  otp: string;
}

interface ValidationState {
  isEmailValid: boolean;
  isPasswordValid: boolean;
}

const SignIn: React.FC = () => {
  const { setSignIn } = useUserState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { GetTerminalConnectionId, Onweb_2step_confirmed } = useSignalR();
  const { LoadKeys } = useCryptoKeys();
  const { bitflexDeviceId } = useBitflexDeviceId();

  // Refs
  const notificationRef = useRef<IBFNotification>(null);

  // State
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    otp: ''
  });

  const [validation, setValidation] = useState<ValidationState>({
    isEmailValid: false,
    isPasswordValid: false
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

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        await BitflexOpenApi.SignApi.apiVversionSignSigninGet("1.0");
        LoadKeys();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initialize();

    // Setup 2FA confirmation handler
    Onweb_2step_confirmed((jwtToken, expiryTimestamp, obfuscatedEmail) => {
      localStorage.setItem("obfuscatedEmail", obfuscatedEmail);
      BitflexOpenApi.Init(jwtToken);
      setSignIn(jwtToken, expiryTimestamp);
      navigate('/wallet/assets');
    });
  }, [LoadKeys, Onweb_2step_confirmed, navigate, setSignIn]);

  // Setup reCAPTCHA
  useEffect(() => {
    if (executeRecaptcha) {
      executeRecaptcha("login_page").then(setRecaptchaToken);
    }
  }, [executeRecaptcha]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [formData]);

  // Form handlers
  const updateFormData = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (ui.isFault) {
      setUi(prev => ({ ...prev, isFault: false }));
    }
  };

  const updateValidation = (field: keyof ValidationState) => (isValid: boolean) => {
    setValidation(prev => ({ ...prev, [field]: isValid }));
  };

  const showNotification = (title: string, message: string, type: BFNotificationType) => {
    notificationRef.current?.Notify(t(title), t(message), type);
  };

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
  }, [formData.email]);

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
  }, [navigate, setSignIn, ui.rememberDevice]);

  const handleSubmit = useCallback(async () => {
    if (!formData.email || !formData.password) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }

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
    }
  }, [formData, ui, bitflexDeviceId, getRecaptchaToken, handleSignInResponse]);

  const handleTwoFactorSubmit = useCallback(async () => {
    if (!formData.email || !formData.password || !formData.otp) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }

    await handleSubmit();
  }, [formData, handleSubmit]);

  // Components
  const RememberDeviceCheckbox: React.FC<{
    isChecked: boolean;
    onToggle: () => void;
    text: string;
  }> = ({ isChecked, onToggle, text }) => (
    <div 
      className="w-full cursor-pointer flex"
      onClick={onToggle}
    >
      <div 
        className="m-1 rounded-md p-2 pl-5 flex justify-between items-center w-full mb-3.5 border"
        style={{
          background: isChecked ? Colors.bitFlexGreenColor : 'transparent',
          borderStyle: isChecked ? 'solid' : 'dashed',
          borderColor: isChecked ? Colors.bitFlexGreenColor : '#433C3C',
        }}
      >
        <div className="text-sm text-white/80">{text}</div>
        <FaCheck 
          className="text-xl text-white m-2.5"
          style={{ opacity: isChecked ? 1 : 0.1 }}
        />
      </div>
    </div>
  );

  const SecurityBadge: React.FC = () => (
    <div className="text-center pt-0">
      <p className="text-white/80">Ensure that you are visiting bcflex.com</p>
      <div 
        className="border border-gray-400 rounded-full p-2 m-1 mx-auto max-w-xs text-center flex justify-center items-center"
      >
        <FaLock color={Colors.bitFlexGreenColor} size={13} />
        <span className="ml-2">
          <span style={{ color: Colors.bitFlexGreenColor }}>https://</span>
          bcflex.com
        </span>
      </div>
    </div>
  );

  const ResendEmailModal: React.FC = () => (
    <BFModalWindow 
      isOpen={ui.showResendModal} 
      title={t('Email Not Confirmed')} 
      onClose={() => setUi(prev => ({ ...prev, showResendModal: false }))}
    >
      <BFNotification ref={notificationRef} />
      <div className="p-4 text-center">
        <p className="mb-4 text-white/80">
          <Trans>Your email address has not been confirmed yet. Would you like us to resend the confirmation email?</Trans>
        </p>
        <p className="mb-6 text-sm text-white/60">
          <Trans>Email:</Trans> <span className="text-white">{formData.email}</span>
        </p>
        
        <div className="flex gap-3 justify-center">
          <BFGradientButton
            buttonType={BFGradientButtonType.Secondary}
            text={t('Cancel')}
            onPress={() => setUi(prev => ({ ...prev, showResendModal: false }))}
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
  );

  const LoginForm: React.FC = () => (
    <div>
      <SecurityBadge />
      
      <div className="mt-4">
        <label><Trans>Email</Trans></label>
        <BFInput
          onValidated={updateValidation('isEmailValid')}
          type={BFInputType.Email}
          placeholder={t('Email used at registration')}
          onValue={updateFormData('email')}
          isError={ui.isFault}
        />
      </div>

      <div className="mt-3">
        <label><Trans>Password</Trans></label>
        <BFInput
          onValidated={updateValidation('isPasswordValid')}
          type={BFInputType.Password}
          placeholder={t('Password')}
          onValue={updateFormData('password')}
          isError={ui.isFault}
        />
      </div>

      <div className="flex justify-between items-center mt-8 mx-1">
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
            Don't Have an Account? <span className="text-yellow-600">Sign up</span>
          </Link>
        </p>
      </div>
    </div>
  );

  const TwoFactorForm: React.FC = () => (
    <div className="text-center">
      <h3 className="form-title">Account Secured</h3>
      <p>Enter one-time-password from Authenticator App</p>
      <img src={bf_shield} width="25%" alt="Security Shield" />
      
      <div className="mt-2.5 mb-1.5">
        <OTPInput
          autoFocus
          isNumberInput
          length={6}
          className="otpContainer"
          inputClassName="otpInput"
          onChangeOTP={(otp) => {
            if (otp.length === 6) {
              updateFormData('otp')(otp);
            }
          }}
        />
      </div>

      <RememberDeviceCheckbox 
        isChecked={ui.rememberDevice} 
        onToggle={() => setUi(prev => ({ ...prev, rememberDevice: !prev.rememberDevice }))}
        text={t('Remember this device?')} 
      />

      <BFGradientButton 
        buttonType={BFGradientButtonType.Action} 
        width="98%" 
        text={t('Confirm')} 
        onPress={handleTwoFactorSubmit} 
      />
    </div>
  );

  return (
    <div className="body-login login flex items-center justify-center" id="maindiv">
      <div className="logo">
        <Link to="/terminal">
          <img 
            src={BitflexLogo} 
            alt="Bitflex Logo" 
            width={isMobile ? '80%' : 350} 
          />
        </Link>
      </div>

      <div className="content">
        <BFNotification ref={notificationRef} />
        
        <div className="box-login">
          <div id="stay-in-place" className="relative">
            <h3 className="form-title"><Trans>Sign In</Trans></h3>
            
            <div className={!ui.requireTfa ? '' : 'app-hover-disabled'}>
              <LoginForm />
            </div>

            <div className="text-center opacity-15 text-xs mt-4">
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
              <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
            </div>
          </div>

          <div className={`${!ui.requireTfa ? 'app-hover-disabled' : 'app-hover-disabled app-hover-active'}`}>
            {ui.requireTfa && twoStepVerificationType === TwoStepVerificationTypes.Google && (
              <TwoFactorForm />
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2.5">
        <p className="neon">
          Flex Technologies Limited. 2021-{new Date().getFullYear()}
        </p>
      </div>

      <ResendEmailModal />
    </div>
  );
};

export default SignIn;