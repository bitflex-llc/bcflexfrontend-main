import { CSSProperties, memo, useCallback, useLayoutEffect, useRef, useState } from "react";

import usePrevious from "../../hooks/usePrevious";

export interface SingleOTPInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  focus?: boolean;
}

export function SingleOTPInputComponent(props: SingleOTPInputProps) {
  const { focus, autoFocus, ...rest } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const prevFocus = usePrevious(!!focus);
  useLayoutEffect(() => {
    if (inputRef.current) {
      if (focus && autoFocus) {
        inputRef.current.focus();
      }
      if (focus && autoFocus && focus !== prevFocus) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [autoFocus, focus, prevFocus]);

  return <input ref={inputRef} {...rest} pattern="[0-9]*" />;
}

const SingleOTPInput = memo(SingleOTPInputComponent);


export interface OTPInputProps {
    length: number;
    onChangeOTP: (otp: string) => any;
  
    autoFocus?: boolean;
    isNumberInput?: boolean;
    disabled?: boolean;
  
    style?: CSSProperties;
    className?: string;
  
    inputStyle?: CSSProperties;
    inputClassName?: string;
  }
  
  export function OTPInputComponent(props: OTPInputProps) {
    const {
      length,
      isNumberInput,
      autoFocus,
      disabled,
      onChangeOTP,
      inputClassName,
      inputStyle,
      ...rest
    } = props;
  
    const [activeInput, setActiveInput] = useState(0);
    const [otpValues, setOTPValues] = useState(Array<string>(length).fill(""));
  
    // Helper to return OTP from inputs
    const handleOtpChange = useCallback(
      (otp: string[]) => {
        const otpValue = otp.join("");
        onChangeOTP(otpValue);
      },
      [onChangeOTP]
    );
  
    // Helper to return value with the right type: 'text' or 'number'
    const getRightValue = useCallback(
      (str: string) => {
        let changedValue = str;
        if (!isNumberInput) {
          return changedValue;
        }
        return !changedValue || /\d/.test(changedValue) ? changedValue : "";
      },
      [isNumberInput]
    );
  
    // Change OTP value at focussing input
    const changeCodeAtFocus = useCallback(
      (str: string) => {
        const updatedOTPValues = [...otpValues];
        updatedOTPValues[activeInput] = str[0] || "";
        setOTPValues(updatedOTPValues);
        handleOtpChange(updatedOTPValues);
      },
      [activeInput, handleOtpChange, otpValues]
    );
  
    // Focus `inputIndex` input
    const focusInput = useCallback(
      (inputIndex: number) => {
        const selectedIndex = Math.max(Math.min(length - 1, inputIndex), 0);
        setActiveInput(selectedIndex);
      },
      [length]
    );
  
    const focusPrevInput = useCallback(() => {
      focusInput(activeInput - 1);
    }, [activeInput, focusInput]);
  
    const focusNextInput = useCallback(() => {
      focusInput(activeInput + 1);
    }, [activeInput, focusInput]);
  
    // Handle onFocus input
    const handleOnFocus = useCallback(
      (index: number) => () => {
        focusInput(index);
      },
      [focusInput]
    );
  
    // Handle onChange value for each input
    const handleOnChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = getRightValue(e.currentTarget.value);
        if (!val) {
          e.preventDefault();
          return;
        }
        changeCodeAtFocus(val);
        focusNextInput();
      },
      [changeCodeAtFocus, focusNextInput, getRightValue]
    );
  
    // Hanlde onBlur input
    const onBlur = useCallback(() => {
      setActiveInput(-1);
    }, []);
  
    // Handle onKeyDown input
    const handleOnKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
          case "Backspace":
          case "Delete": {
            e.preventDefault();
            if (otpValues[activeInput]) {
              changeCodeAtFocus("");
            } else {
              focusPrevInput();
            }
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            focusPrevInput();
            break;
          }
          case "ArrowRight": {
            e.preventDefault();
            focusNextInput();
            break;
          }
          case " ": {
            e.preventDefault();
            break;
          }
          default:
            break;
        }
      },
      [activeInput, changeCodeAtFocus, focusNextInput, focusPrevInput, otpValues]
    );
  
    const handleOnPaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
          .getData("text/plain")
          .trim()
          .slice(0, length - activeInput)
          .split("");
        if (pastedData) {
          let nextFocusIndex = 0;
          const updatedOTPValues = [...otpValues];
          updatedOTPValues.forEach((val, index) => {
            if (index >= activeInput) {
              const changedValue = getRightValue(pastedData.shift() || val);
              if (changedValue) {
                updatedOTPValues[index] = changedValue;
                nextFocusIndex = index;
              }
            }
          });
          setOTPValues(updatedOTPValues);
          setActiveInput(Math.min(nextFocusIndex + 1, length - 1));
        }
      },
      [activeInput, getRightValue, length, otpValues]
    );
  
    return (
      <div {...rest}>
        {Array(length)
          .fill("")
          .map((_, index) => (
            <SingleOTPInput
              key={`SingleInput-${index}`}
              focus={activeInput === index}
              value={otpValues && otpValues[index]}
              autoFocus={autoFocus}
              onFocus={handleOnFocus(index)}
              onChange={handleOnChange}
              onKeyDown={handleOnKeyDown}
              onBlur={onBlur}
              onPaste={handleOnPaste}
              style={inputStyle}
              className={inputClassName}
              disabled={disabled}
              
            />
          ))}
      </div>
    );
  }
  
  const OTPInput = memo(OTPInputComponent);
  export default OTPInput;