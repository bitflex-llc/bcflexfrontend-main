import Colors from "../../Colors";

export const signInStyles = {
  bodyLogin: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxContainer: {
    width: '100%',
    cursor: 'pointer',
    display: 'flex'
  },
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
  checkboxText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  checkboxIcon: (isChecked: boolean) => ({
    fontSize: 20,
    color: 'white',
    margin: 10,
    opacity: isChecked ? 1 : 0.1
  }),
  securityBadgeContainer: {
    textAlign: 'center' as const,
    paddingTop: 0
  },
  securityBadgeText: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
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
  securityBadgeUrl: {
    marginLeft: 8
  },
  httpsText: {
    color: Colors.bitFlexGreenColor
  },
  fieldContainer: {
    marginTop: 16
  },
  fieldContainerSpaced: {
    marginTop: 12
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginLeft: 4,
    marginRight: 4
  },
  copyrightContainer: {
    textAlign: 'center' as const,
    marginTop: 10
  },
  modalContent: {
    padding: 16,
    textAlign: 'center' as const
  },
  modalText: {
    marginBottom: 16,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  modalEmailText: {
    marginBottom: 24,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)'
  },
  modalEmailValue: {
    color: 'white'
  },
  modalButtonContainer: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center'
  },
  otpContainer: {
    marginTop: 10,
    marginBottom: 6
  },
  twoFactorContainer: {
    textAlign: 'center' as const
  },
  recaptchaContainer: {
    textAlign: 'center' as const,
    opacity: 0.15,
    fontSize: 12,
    marginTop: 16
  },
  formTitleSpacing: {
    position: 'relative' as const
  }
};