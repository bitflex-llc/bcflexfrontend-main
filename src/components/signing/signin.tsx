// ====================================================================================
// IMPORTS - All the stuff we need from other files
// ====================================================================================

// React stuff - the basic building blocks
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Router stuff - for navigation between pages
import { Link, useNavigate } from 'react-router-dom';

// Translation stuff - for multiple languages
import { Trans, useTranslation } from 'react-i18next';

// Device detection - to know if user is on mobile
import { isMobile } from 'react-device-detect';

// Icons - pretty symbols
import { FaCheck, FaLock } from 'react-icons/fa';

// Our custom components - reusable UI pieces
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from '../html/BFInput';
import { BFNotification, BFNotificationType, IBFNotification } from '../html/BFNotification';
import { BFModalWindow } from '../html/BFModalWindow';
import OTPInput from '../html/BFOTPInput';

// Our custom hooks - reusable logic pieces
import { useBitflexDeviceId } from '../../hooks/useBitflexDeviceId';
import { useCryptoKeys } from '../../hooks/useCryptoKeys';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';

// API stuff - for talking to the server
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { SignInResponseResult, TwoStepVerificationTypes } from '../../api-wrapper';

// Images and styles - make it look pretty
import BitflexLogo from '../../images/bitflex-logo.svg';
import bf_shield from '../../images/shield.svg';
import Colors from '../../Colors';
import '../../css/signlayout.css';

// ====================================================================================
// TYPE DEFINITIONS - What shape our data should have
// ====================================================================================

// What our form data looks like
interface FormData {
  email: string;      // User's email address
  password: string;   // User's password
  otp: string;        // One-time password for 2FA
}

// What our validation state looks like
interface ValidationState {
  isEmailValid: boolean;    // Is the email format correct?
  isPasswordValid: boolean; // Is the password format correct?
}

// ====================================================================================
// STYLES - How everything should look (inline styles instead of Tailwind)
// ====================================================================================

const styles = {
  // Main container styles
  bodyLogin: {
    display: 'flex' as const, // Fixed: was 'row', should be 'flex'
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Checkbox container styles
  checkboxContainer: {
    width: '100%',
    cursor: 'pointer',
    display: 'flex'
  },

  // Checkbox inner box styles
  checkboxBox: (isChecked: boolean) => ({
    margin: 4,
    borderRadius: 6,
    padding: 8,
    paddingLeft: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
    border: '1px solid',
    background: isChecked ? Colors.bitFlexGreenColor : 'transparent',
    borderStyle: isChecked ? 'solid' : 'dashed',
    borderColor: isChecked ? Colors.bitFlexGreenColor : '#433C3C'
  }),

  // Checkbox text styles
  checkboxText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },

  // Checkbox icon styles
  checkboxIcon: (isChecked: boolean) => ({
    fontSize: 20,
    color: 'white',
    margin: 10,
    opacity: isChecked ? 1 : 0.1
  }),

  // Security badge container styles
  securityBadgeContainer: {
    textAlign: 'center' as const,
    paddingTop: 0
  },

  // Security badge text styles
  securityBadgeText: {
    color: 'rgba(255, 255, 255, 0.8)'
  },

  // Security badge URL box styles
  securityBadgeBox: {
    border: '1px solid #9CA3AF',
    borderRadius: 9999,
    padding: 8,
    margin: 4,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 320,
    textAlign: 'center' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Security badge URL text styles
  securityBadgeUrl: {
    marginLeft: 8
  },

  // HTTPS text styles
  httpsText: {
    color: Colors.bitFlexGreenColor
  },

  // Form field container styles
  fieldContainer: {
    marginTop: 16
  },

  // Form field container with more spacing
  fieldContainerSpaced: {
    marginTop: 12
  },

  // Submit button container styles
  submitContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginLeft: 4,
    marginRight: 4
  },

  // Copyright text container styles
  copyrightContainer: {
    textAlign: 'center' as const,
    marginTop: 10
  },

  // Modal content styles
  modalContent: {
    padding: 16,
    textAlign: 'center' as const
  },

  // Modal text styles
  modalText: {
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.8)'
  },

  // Modal email text styles
  modalEmailText: {
    marginBottom: 24,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)'
  },

  // Modal email value styles
  modalEmailValue: {
    color: 'white'
  },

  // Modal button container styles
  modalButtonContainer: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center'
  },

  // OTP input container styles
  otpContainer: {
    marginTop: 10,
    marginBottom: 6
  },

  // Two factor form container styles
  twoFactorContainer: {
    textAlign: 'center' as const
  },

  // reCAPTCHA disclaimer container styles
  recaptchaContainer: {
    textAlign: 'center' as const,
    opacity: 0.15,
    fontSize: 12,
    marginTop: 16
  },

  // Form title spacing
  formTitleSpacing: {
    position: 'relative' as const
  }
};

// ====================================================================================
// COMPONENT DEFINITIONS - Smaller pieces of UI (MOVED OUTSIDE TO PREVENT RE-CREATION)
// ====================================================================================

// Checkbox for "remember this device" - MEMOIZED to prevent re-renders
const RememberDeviceCheckbox = React.memo<{
  isChecked: boolean;   // Is it checked?
  onToggle: () => void; // What to do when clicked
  text: string;         // What text to show
}>(({ isChecked, onToggle, text }) => (
  <div
    style={styles.checkboxContainer}
    onClick={onToggle} // Click anywhere to toggle
  >
    <div style={styles.checkboxBox(isChecked)}>
      <div style={styles.checkboxText}>{text}</div>
      <FaCheck style={styles.checkboxIcon(isChecked)} />
    </div>
  </div>
));

// Security badge showing the URL - MEMOIZED to prevent re-renders
const SecurityBadge = React.memo(() => (
  <div style={styles.securityBadgeContainer}>
    <p style={styles.securityBadgeText}>Ensure that you are visiting bcflex.com</p>
    <div style={styles.securityBadgeBox}>
      <FaLock color={Colors.bitFlexGreenColor} size={13} />
      <span style={styles.securityBadgeUrl}>
        <span style={styles.httpsText}>https://</span>
        bcflex.com
      </span>
    </div>
  </div>
));

// ====================================================================================
// MAIN COMPONENT - The signin page
// ====================================================================================

const SignIn: React.FC = () => {

  // ====================================================================================
  // HOOKS - Get functionality from other parts of the app
  // ====================================================================================

  const { setSignIn } = useUserState();                    // For managing user login state
  const navigate = useNavigate();                          // For going to other pages
  const { t } = useTranslation();                          // For translating text
  const { executeRecaptcha } = useGoogleReCaptcha();       // For spam protection
  const { GetTerminalConnectionId, Onweb_2step_confirmed } = useSignalR(); // For real-time updates
  const { LoadKeys } = useCryptoKeys();                    // For encryption keys
  const { bitflexDeviceId } = useBitflexDeviceId();        // For device identification

  // ====================================================================================
  // REFS - For directly accessing DOM elements
  // ====================================================================================

  // Reference to the notification component so we can show messages
  const notificationRef = useRef<IBFNotification>(null);

  // ====================================================================================
  // STATE - Data that can change and cause re-renders
  // ====================================================================================

  // Form data - what the user types in
  const [formData, setFormData] = useState<FormData>({
    email: '',      // Start with empty email
    password: '',   // Start with empty password
    otp: ''         // Start with empty OTP
  });

  // Validation state - whether form fields are valid
  const [validation, setValidation] = useState<ValidationState>({
    isEmailValid: false,    // Email starts as invalid
    isPasswordValid: false  // Password starts as invalid
  });

  // UI state - controls what the user sees
  const [ui, setUi] = useState({
    isFault: false,           // Should we show error styling?
    requireTfa: false,        // Should we show 2FA form?
    isLoading: false,         // Should we show loading spinner?
    rememberDevice: false,    // Should we remember this device?
    showResendModal: false,   // Should we show email resend modal?
    isResendLoading: false    // Is the resend email request loading?
  });

  // What type of 2FA the user has enabled
  const [twoStepVerificationType, setTwoStepVerificationType] = useState<TwoStepVerificationTypes>();

  // Google reCAPTCHA token for spam protection
  const [recaptchaToken, setRecaptchaToken] = useState('');

  // ====================================================================================
  // EFFECT HOOKS - Code that runs when component mounts or data changes
  // ====================================================================================

  // Initialize component when it first loads
  useEffect(() => {
    // Function to set up the component
    const initialize = async () => {
      try {
        // Make sure the API is ready
        await BitflexOpenApi.SignApi.apiVversionSignSigninGet("1.0");
        // Load encryption keys
        LoadKeys();
      } catch (error) {
        // If something goes wrong, log it
        console.error('Initialization error:', error);
      }
    };

    // Actually run the initialization
    initialize();

    // Setup handler for when 2FA is confirmed
    Onweb_2step_confirmed((jwtToken, expiryTimestamp, obfuscatedEmail) => {
      // Save the user's email (partially hidden for security)
      localStorage.setItem("obfuscatedEmail", obfuscatedEmail);
      // Set up the API with the new token
      BitflexOpenApi.Init(jwtToken);
      // Log the user in
      setSignIn(jwtToken, expiryTimestamp);
      // Go to the wallet page
      navigate('/wallet/assets');
    });
  }, [LoadKeys, Onweb_2step_confirmed, navigate, setSignIn]); // Only run when these change

  // Setup reCAPTCHA when component loads
  useEffect(() => {
    if (executeRecaptcha) {
      // Get a reCAPTCHA token for the login page
      executeRecaptcha("login_page").then(setRecaptchaToken);
    }
  }, [executeRecaptcha]); // Only run when executeRecaptcha changes

  // Listen for keyboard events (like Enter key)
  useEffect(() => {
    // Function to handle key presses
    const handleKeyPress = (event: KeyboardEvent) => {
      // If user presses Enter, try to submit the form
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        handleSubmit();
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyPress);

    // Cleanup function - remove the event listener when component unmounts
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [formData]); // Run again when form data changes

  // ====================================================================================
  // FORM HANDLERS - Functions that handle form interactions
  // ====================================================================================

  // Function to update form data
  const updateFormData = useCallback((field: keyof FormData) => (value: string) => {
    // Update the specific field with the new value
    setFormData(prev => ({ ...prev, [field]: value }));

    // If there was an error before, clear it
    if (ui.isFault) {
      setUi(prev => ({ ...prev, isFault: false }));
    }
  }, [ui.isFault]); // Only recreate when isFault changes

  // Function to update validation state
  const updateValidation = useCallback((field: keyof ValidationState) => (isValid: boolean) => {
    // Update the specific validation field
    setValidation(prev => ({ ...prev, [field]: isValid }));
  }, []); // No dependencies - this function never changes

  // Function to show notifications to the user
  const showNotification = useCallback((title: string, message: string, type: BFNotificationType) => {
    // Use the notification component to show a message
    notificationRef.current?.Notify(t(title), t(message), type);
  }, [t]); // Only recreate when translation function changes

  // Function to get a fresh reCAPTCHA token
  const getRecaptchaToken = useCallback(async (): Promise<string> => {
    if (executeRecaptcha) {
      // Get a new token
      const token = await executeRecaptcha("login_page");
      // Save it for later use
      setRecaptchaToken(token);
      return token;
    }
    // If we can't get a new token, return the old one
    return recaptchaToken;
  }, [executeRecaptcha, recaptchaToken]);

  // Function to handle resending email confirmation
  const handleResendEmailConfirmation = useCallback(async () => {
    // Make sure we have an email
    if (!formData.email) {
      showNotification('Error', 'Email is required', BFNotificationType.Error);
      return;
    }

    // Show loading state
    setUi(prev => ({ ...prev, isResendLoading: true }));

    try {
      // Call the API to resend confirmation email
      const response = await BitflexOpenApi.SignApi.apiVversionSignResendemailconfirmationPost("1.0", {
        email: formData.email
      });

      // Check if it worked
      if (response.data.success) {
        showNotification('Success', 'Email confirmation sent successfully', BFNotificationType.Success);
        // Close the modal
        setUi(prev => ({ ...prev, showResendModal: false }));
      } else {
        showNotification('Error', 'Failed to send email confirmation', BFNotificationType.Error);
      }
    } catch (error) {
      // If something went wrong, show error
      showNotification('Error', 'Error sending email confirmation. Please try again later', BFNotificationType.Error);
    } finally {
      // Always stop the loading state
      setUi(prev => ({ ...prev, isResendLoading: false }));
    }
  }, [formData.email, showNotification]);

  // Function to handle the response from sign-in API
  const handleSignInResponse = useCallback((result: any) => {
    // Check what the server said and act accordingly
    switch (result.data.result) {

      // reCAPTCHA failed - probably a bot
      case SignInResponseResult.ReCaptchav3Failed:
        showNotification('Error', 'ReCaptcha failed, try again', BFNotificationType.Error);
        window.location.reload(); // Refresh the page
        break;

      // Login successful!
      case SignInResponseResult.Success:
        if (result.data.authToken) {
          // Set up the API with the new token
          BitflexOpenApi.Init(result.data.authToken);

          // Save the user's email if provided
          if (result.data.email) {
            localStorage.setItem("obfuscatedEmail", result.data.email);
          }

          // Save remember device token if user chose to remember
          if (result.data.rememberDeviceToken && ui.rememberDevice) {
            localStorage.setItem("rememberDeviceId", result.data.rememberDeviceToken);
          }

          // Log the user in and go to wallet
          setSignIn(result.data.authToken, result.data.expiryTimestamp);
          navigate('/wallet/assets', { state: { requireSetPush: true } });
        } else {
          // Something went wrong on the server
          showNotification('Error', 'Error on server side. Try again later', BFNotificationType.Error);
        }
        break;

      // Wrong username or password
      case SignInResponseResult.WrongCredentials:
      case SignInResponseResult.WrongPassword:
        showNotification('Error', 'Invalid email and/or password', BFNotificationType.Error);
        setUi(prev => ({ ...prev, isFault: true })); // Show error styling
        break;

      // Email not confirmed - show modal to resend confirmation
      case SignInResponseResult.EmailNotConfirmed:
        setUi(prev => ({ ...prev, showResendModal: true }));
        break;

      // Need 2FA code
      case SignInResponseResult.RequireTwoFactor:
        showNotification('Two Step Verification', 'Please complete two step verification', BFNotificationType.Warning);
        setUi(prev => ({ ...prev, requireTfa: true }));
        setTwoStepVerificationType(result.data.twoFactorType);
        break;

      // Device ID problem
      case SignInResponseResult.BitflexDeviceIdIsNotPresent:
        showNotification('Error', 'BCFLEX device generation Error, try to clear cache', BFNotificationType.Error);
        break;

      // Wrong 2FA code
      case SignInResponseResult.GoogleTfaWrong:
        showNotification('Error', 'Wrong Code', BFNotificationType.Error);
        break;

      // Something else went wrong
      default:
        showNotification('Error', 'Unknown error occurred', BFNotificationType.Error);
    }
  }, [navigate, setSignIn, ui.rememberDevice, showNotification]);

  // Main submit function - handles the login attempt
  const handleSubmit = useCallback(async () => {
    // Make sure we have email and password
    if (!formData.email || !formData.password) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }

    // Show loading state
    setUi(prev => ({ ...prev, isLoading: true }));

    try {
      // Get a fresh reCAPTCHA token
      const token = await getRecaptchaToken();

      // Call the sign-in API
      const response = await BitflexOpenApi.SignApi.apiVversionSignSigninPost("1.0", {
        email: formData.email,
        password: formData.password,
        reCaptchav3Token: token,
        bitflexDeviceId: bitflexDeviceId,
        rememberedDeviceToken: localStorage.getItem("rememberDeviceId"),
        // If we need 2FA and have a code, include it
        ...(ui.requireTfa && formData.otp && {
          googleTfaCode: formData.otp,
          rememberDevice: ui.rememberDevice
        })
      });

      // Handle the response
      handleSignInResponse(response);
    } catch (error) {
      // If something went wrong, show error
      showNotification('Error', 'Account is locked or unrecognized error appear. Contact support Telegram: @bitflex_exchange', BFNotificationType.Error);
    } finally {
      // Always stop the loading state
      setUi(prev => ({ ...prev, isLoading: false }));
    }
  }, [formData, ui, bitflexDeviceId, getRecaptchaToken, handleSignInResponse, showNotification]);

  // Function to handle 2FA submission
  const handleTwoFactorSubmit = useCallback(async () => {
    // Make sure we have all required fields
    if (!formData.email || !formData.password || !formData.otp) {
      showNotification('Error', 'Fill in all fields', BFNotificationType.Error);
      return;
    }

    // Use the main submit function
    await handleSubmit();
  }, [formData, handleSubmit, showNotification]);

  // Close modal handler - MEMOIZED to prevent re-creation
  const handleCloseResendModal = useCallback(() => {
    setUi(prev => ({ ...prev, showResendModal: false }));
  }, []);

  // Toggle remember device handler - MEMOIZED to prevent re-creation
  const handleToggleRememberDevice = useCallback(() => {
    setUi(prev => ({ ...prev, rememberDevice: !prev.rememberDevice }));
  }, []);

  // ====================================================================================
  // MAIN RENDER - What actually gets shown on the page
  // ====================================================================================

  return (
    <div className="body-login login" style={styles.bodyLogin} id="maindiv">

      {/* Logo at the top */}
      <div className="logo">
        <Link to="/terminal">
          <img
            src={BitflexLogo}
            alt="Bitflex Logo"
            width={isMobile ? '80%' : 350} // Smaller on mobile
          />
        </Link>
      </div>

      {/* Main content area */}
      <div className="content">
        <BFNotification ref={notificationRef} />

        <div className="box-login">

          {/* Regular login form */}
          <div id="stay-in-place" style={styles.formTitleSpacing}>
            <h3 className="form-title"><Trans>Sign In</Trans></h3>

            <div className={!ui.requireTfa ? '' : 'app-hover-disabled'}>
              {/* Security badge at the top */}
              <SecurityBadge />

              {/* Email input field */}
              <div style={styles.fieldContainer}>
                <label><Trans>Email</Trans></label>
                <BFInput
                  onValidated={updateValidation('isEmailValid')} // Update validation when changed
                  type={BFInputType.Email}
                  placeholder={t('Email used at registration')}
                  onValue={updateFormData('email')} // Update form data when changed
                  isError={ui.isFault} // Show error styling if needed
                />
              </div>

              {/* Password input field */}
              <div style={styles.fieldContainerSpaced}>
                <label><Trans>Password</Trans></label>
                <BFInput
                  onValidated={updateValidation('isPasswordValid')} // Update validation when changed
                  type={BFInputType.Password}
                  placeholder={t('Password')}
                  onValue={updateFormData('password')} // Update form data when changed
                  isError={ui.isFault} // Show error styling if needed
                />
              </div>

              {/* Submit button and forgot password link */}
              <div style={styles.submitContainer}>
                <BFGradientButton
                  isDisabled={!validation.isEmailValid || !validation.isPasswordValid} // Disable if invalid
                  isLoading={ui.isLoading} // Show spinner when loading
                  buttonType={BFGradientButtonType.Action}
                  text={t('Submit')}
                  onPress={handleSubmit} // Call submit function when clicked
                />
                <Link to="/signing/restore" className="dot">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign up link */}
              <div className="create-acc">
                <p>
                  <Link to="/signup">
                    Don't Have an Account? <span style={{ color: '#cf8900' }}>Sign up</span>
                  </Link>
                </p>
              </div>
            </div>

            {/* reCAPTCHA disclaimer */}
            <div style={styles.recaptchaContainer}>
              This site is protected by reCAPTCHA and the Google
              <a href="https://policies.google.com/privacy"> Privacy Policy</a> and
              <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
            </div>
          </div>

          {/* Two-factor authentication form (shown when needed) */}
          <div className={`${!ui.requireTfa ? 'app-hover-disabled' : 'app-hover-disabled app-hover-active'}`}>
            {ui.requireTfa && twoStepVerificationType === TwoStepVerificationTypes.Google && (
              <div style={styles.twoFactorContainer}>
                <h3 className="form-title">Account Secured</h3>
                <p>Enter one-time-password from Authenticator App</p>
                <img src={bf_shield} width="25%" alt="Security Shield" />

                {/* OTP input field */}
                <div style={styles.otpContainer}>
                  <OTPInput
                    autoFocus // Focus this field automatically
                    isNumberInput // Only allow numbers
                    length={6} // 6 digits long
                    className="otpContainer"
                    inputClassName="otpInput"
                    onChangeOTP={(otp) => {
                      // When user enters 6 digits, save it
                      if (otp.length === 6) {
                        updateFormData('otp')(otp);
                      }
                    }}
                  />
                </div>

                {/* Remember device checkbox */}
                <RememberDeviceCheckbox
                  isChecked={ui.rememberDevice}
                  onToggle={handleToggleRememberDevice}
                  text={t('Remember this device?')}
                />

                {/* Confirm button */}
                <BFGradientButton
                  buttonType={BFGradientButtonType.Action}
                  width="98%"
                  text={t('Confirm')}
                  onPress={handleTwoFactorSubmit} // Call 2FA submit function
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copyright notice */}
      <div style={styles.copyrightContainer}>
        <p className="neon">
          Flex Technologies Limited. 2021-{new Date().getFullYear()}
        </p>
      </div>

      {/* Email resend modal (shown when needed) - ONLY RENDER WHEN NEEDED */}
      {ui.showResendModal && (
        <BFModalWindow
          isOpen={ui.showResendModal}
          title={t('Email Not Confirmed')}
          onClose={handleCloseResendModal}
        >
          <div style={styles.modalContent}>
            <p style={styles.modalText}>
              <Trans>Your email address has not been confirmed yet. Would you like us to resend the confirmation email?</Trans>
            </p>
            <p style={styles.modalEmailText}>
              <Trans>Email:</Trans> <span style={styles.modalEmailValue}>{formData.email}</span>
            </p>

            <div style={styles.modalButtonContainer}>
              {/* Cancel button */}
              <BFGradientButton
                buttonType={BFGradientButtonType.Destructive}
                text={t('Cancel')}
                onPress={handleCloseResendModal}
                width="120px"
              />
              {/* Resend button */}
              <BFGradientButton
                buttonType={BFGradientButtonType.Action}
                text={t('Resend Email')}
                isLoading={ui.isResendLoading} // Show spinner when loading
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

// Export the component so other files can use it
export default SignIn;