import * as blockies from 'blockies-ts';

import { KeyboardEventHandler, useEffect, useMemo, useState } from "react";

import Colors from "../../Colors";
import { FaCheckCircle } from 'react-icons/fa';
import { useCallback } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import countryList from 'react-select-country-list'
import { isMobile } from 'react-device-detect';
import React from 'react';
import PhoneInput from 'react-phone-input-2'
import parsePhoneNumber from 'libphonenumber-js'
import { Type } from '../../api-wrapper';

function IsFloatOnly(value): boolean {
    const regExp = new RegExp(/^\d{1,16}(\.\d{1,16})?$/);
    return regExp.test(value)
}

export enum BFInputType {
    Email,
    Password,
    Decimal,
    Text,
    CryptoAddress,
    Int,
    MultiLineText,
    Country,
    KYCDocumentType,
    Phone
}

export enum KYCDocumentType {
    NationalID = 'National Id',
    Passport = 'Passport',
    DrivingLicense = 'Driving License'
}

export function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const BFInput = ({
    placeholder,
    leftsideSymbol,
    type,
    isDisabled,
    isForceShowDisabledValue = false,
    onValue,
    setValue,
    minimumAmount,
    isError,
    ErrorText,
    width = '100%',
    onValidated,
    shouldBeEqualTo,
    shouldBeEqualErrorMessage,
    hasBlockieImage = false,
    minStringLength,
    maxStringLength,
    debounceTime = 500,
    onDebouncedValue,
    onKeyDown,
    maxValue,
    minValue,
    labelText,
    onFocus,
    onBlur,
    cryptoType
}: {
    placeholder?: string,
    leftsideSymbol?: string,
    type: BFInputType,
    isDisabled?: boolean,
    isForceShowDisabledValue?: boolean,
    onValue?,
    setValue?: number | string,
    minimumAmount?: number,
    isError?: boolean,
    ErrorText?: string,
    width?: number | string,
    onValidated?,
    shouldBeEqualTo?: string,
    shouldBeEqualErrorMessage?: string,
    hasBlockieImage?: boolean,
    minStringLength?: number,
    maxStringLength?: number,
    debounceTime?: number,
    onDebouncedValue?: Function,
    onKeyDown?,
    maxValue?: number,
    minValue?: number,
    labelText?: string
    onFocus?: Function,
    onBlur?: Function,
    cryptoType?: Type
}): JSX.Element => {
    const { t } = useTranslation();
    const [isErrorState, setisErrorState] = useState(isError);
    const [errorText, seterrorText] = useState<string>();
    
    // FIXED: Initialize with empty string instead of undefined
    const [valueInside, setvalueInside] = useState<string>('');
    const [rawValue, setrawValue] = useState<string>('');

    const [debounceValue, setdebounceValue] = useDebounce('', debounceTime)

    const [isCountryPickerActive, setisCountryPickerActive] = useState(false);
    const countriesListMemo = useMemo(() => countryList().getData(), [])

    const [isDocumentTypePickerActive, setisDocumentTypePickerActive] = useState(false);
    const [isPhoneTypePickerActive, setisPhoneTypePickerActive] = useState(false);

    const validateEmail = (text) => {
        const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        return tester.test(text);
    }

    useEffect(() => {
        if (setValue !== undefined) {
            // FIXED: Always convert to string
            setvalueInside(String(setValue));
        }
    }, [setValue])

    useEffect(() => {
        if (onDebouncedValue) {
            onDebouncedValue(debounceValue);
        }
    }, [debounceValue, onDebouncedValue]);

    useEffect(() => {
        if (isError) {
            setisErrorState(true)
            seterrorText(ErrorText);
        } else {
            setisErrorState(false)
        }
    }, [ErrorText, isError]);

    const elemrandId = useMemo(() => makeid(12), []); // FIXED: Use useMemo to prevent regeneration
    const [isValid, setisValid] = useState<boolean | undefined>(undefined);

    const validate = useCallback((isSilent: boolean, value?: string) => {
        const valuetoValidate = value || rawValue;

        if (!valuetoValidate) {
            if (onValidated) onValidated(false);
            if (onValue) onValue(''); // FIXED: Pass empty string instead of undefined
            setvalueInside('');
            return;
        }

        if (maxStringLength) {
            if (valuetoValidate.length > maxStringLength) {
                if (onValidated) onValidated(false);
                seterrorText('Max length: ' + maxStringLength + ' characters');
                setisErrorState(true);
                return;
            }
        }

        if (type === BFInputType.Decimal || type === BFInputType.Text || type === BFInputType.Int) {
            if (onValidated) onValidated(true);
            return;
        }

        if (shouldBeEqualTo && shouldBeEqualErrorMessage) {
            if (valuetoValidate !== shouldBeEqualTo) {
                seterrorText(shouldBeEqualErrorMessage);
                setisErrorState(true);
                return;
            }
        }

        let validationRes;
        switch (type) {
            case BFInputType.Email:
                validationRes = validateEmail(valuetoValidate);
                if (!validationRes) seterrorText(t('Invalid Email format'));
                break;

            case BFInputType.Password:
                validationRes = valuetoValidate.length >= 8;
                if (!validationRes) seterrorText(t('Invalid Password Length. Minimum 8 characters'));
                break;

            case BFInputType.CryptoAddress:
                if (!minStringLength) return;
                validationRes = valuetoValidate.length >= minStringLength;
                if (!validationRes) seterrorText(t('Invalid Address Length. Minimum ' + minStringLength + ' characters'));

                if (cryptoType && cryptoType === Type.Tron) {
                    const regExp = new RegExp(/T[A-Za-z1-9]{33}/);
                    if (!regExp.test(valuetoValidate)) {
                        seterrorText(t('Invalid Address Format. Expected: ' + Type[Type.Tron] + ' address format'));
                        return;
                    }
                }
                break;
        }

        if (!validationRes) {
            if (!isSilent) {
                if (onValidated) onValidated(false);
                setisValid(false);
            }
        } else {
            if (onValidated) onValidated(true);
            setisValid(true);
        }

        if (!isError) {
            setisErrorState(!validationRes);
        }
    }, [rawValue, type, shouldBeEqualTo, shouldBeEqualErrorMessage, isError, onValidated, onValue, t, minStringLength, cryptoType, maxStringLength]);

    useEffect(() => {
        const element = document.getElementById(elemrandId);
        if (element) {
            if (isErrorState) {
                element.classList.add('error');
            } else {
                element.classList.remove('error');
            }
        }
    }, [elemrandId, isErrorState]);

    useEffect(() => {
        if (rawValue && type === BFInputType.Password) {
            if (!isErrorState && rawValue.length >= 8) {
                validate(true);
            } else {
                setisValid(false);
                if (onValidated) onValidated(false);
            }
        }
    }, [isErrorState, rawValue, type, validate, onValidated]);

    const [blockieimage, setblockieimage] = useState<string>();

    const onChangeListener = useCallback((e) => {
        setisErrorState(false);
        const rawVal = e.target.value;

        if (!shouldBeEqualTo) {
            validate(true, rawVal);
        }

        switch (type) {
            case BFInputType.Email:
            case BFInputType.Password:
            case BFInputType.MultiLineText:
            case BFInputType.Country:
            case BFInputType.KYCDocumentType:
            case BFInputType.Text:
                setvalueInside(rawVal);
                if (onValue) onValue(rawVal);
                break;

            case BFInputType.CryptoAddress:
                if (hasBlockieImage) {
                    if (rawVal.length > 0) {
                        setblockieimage(blockies.create({ seed: rawVal, size: 8, scale: 8 }).toDataURL());
                    } else {
                        setblockieimage(undefined);
                    }
                }
                setvalueInside(rawVal);
                if (onValue) onValue(rawVal);
                break;

            case BFInputType.Decimal:
                const commaChange = rawVal.replace(/,/g, '.');
                if (rawVal.charAt(rawVal.length - 1) === '.') {
                    setvalueInside(rawVal);
                    return;
                }

                const splittedValue = rawVal.split('.')[1];
                if (splittedValue && splittedValue.length > 8) {
                    setvalueInside(rawVal.substring(0, rawVal.length - 1));
                    seterrorText(t('Max decimals count') + ': 8');
                    setisErrorState(true);
                    setTimeout(() => setisErrorState(false), 5000);
                    return;
                }

                const isNumber = IsFloatOnly(rawVal);
                if (!isNumber) {
                    setvalueInside(rawVal.substring(0, rawVal.length - 1));
                } else {
                    if (maxValue && parseFloat(commaChange) > maxValue) {
                        seterrorText(t('Max Amount') + ': ' + maxValue);
                        setisErrorState(true);
                        return;
                    }
                    setvalueInside(rawVal);
                    if (onValue) onValue(parseFloat(commaChange));
                }
                break;

            case BFInputType.Int:
                const value = parseInt(rawVal);
                if (!Number.isInteger(value)) {
                    setvalueInside(rawVal.substring(0, rawVal.length - 1));
                } else {
                    setvalueInside(rawVal);
                    if (onValue) onValue(value);
                }
                break;
        }
        
        setrawValue(rawVal);
        setdebounceValue(rawVal);
    }, [type, shouldBeEqualTo, validate, hasBlockieImage, onValue, maxValue, t]);

    const handleBlur = useCallback(() => {
        if (type !== BFInputType.Int) {
            validate(false);
        }
        if (onBlur) onBlur();
    }, [type, validate, onBlur]);

    const handleFocus = useCallback((e) => {
        if (onFocus) {
            onFocus(e);
        } else if (type === BFInputType.Country) {
            setisCountryPickerActive(true);
        }
    }, [onFocus, type]);

    if (type === BFInputType.MultiLineText) {
        return (
            <div className='shakeForm' style={{ position: 'relative', width: '100%', marginBottom: labelText ? 10 : 'unset' }}>
                {labelText && <label htmlFor={elemrandId} style={{ fontFamily: 'Roboto Condensed' }}>{labelText}</label>}
                <textarea
                    id={elemrandId}
                    className={hasBlockieImage ? 'input-md input-inline-form maxwidth rightborder' : 'input-inline-form transition'}
                    onKeyDown={onKeyDown}
                    rows={4}
                    onChange={onChangeListener}
                    disabled={isDisabled}
                    style={{ 
                        opacity: !isDisabled ? 1.0 : 0.7, 
                        width: '100%', 
                        position: 'relative', 
                        resize: 'none', 
                        height: 120, 
                        boxSizing: 'border-box' 
                    }}
                    value={isDisabled ? '' : valueInside}
                />
            </div>
        );
    }

    return (
        <div className='shakeForm' style={{ position: 'relative', width: '100%', marginBottom: labelText ? 10 : 'unset' }}>
            {labelText && <label htmlFor={elemrandId} style={{ fontFamily: 'Roboto Condensed' }}>{labelText}</label>}
            <input
                id={elemrandId}
                className={hasBlockieImage ? 'input-md input-inline-form maxwidth rightborder' : 'input-inline-form transition'}
                onKeyDown={onKeyDown}
                onChange={onChangeListener}
                type={type === BFInputType.Password ? 'password' : 'text'}
                autoComplete={'off'} 
                autoCorrect={'off'}
                disabled={isDisabled}
                style={{ 
                    opacity: !isDisabled ? 1.0 : 0.7, 
                    width: width, 
                    position: 'relative', 
                    paddingRight: hasBlockieImage ? 50 : 0 
                }}
                placeholder={placeholder}
                value={isForceShowDisabledValue ? valueInside : isDisabled ? '' : valueInside}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />

            {isCountryPickerActive && countriesListMemo && (
                <div style={{
                    background: Colors.TextInput, 
                    marginLeft: 1, 
                    marginRight: 15, 
                    zIndex: 10, 
                    border: '1px solid ' + Colors.BITFLEXBorderTerminal,
                    maxHeight: type === BFInputType.Country ? isMobile ? 250 : 400 : 82, 
                    overflow: 'scroll', 
                    borderRadius: 2, 
                    position: 'absolute', 
                    width: 'calc(100% - 4px)'
                }}>
                    {countriesListMemo.map((value, i) => (
                        <div 
                            key={i} 
                            style={{ padding: 6, fontSize: 16 }} 
                            onClick={() => {
                                setvalueInside(value.label);
                                setisCountryPickerActive(false);
                                if (onValue) onValue(value.label);
                            }}
                        >
                            {value.label}
                        </div>
                    ))}
                </div>
            )}

            {leftsideSymbol && <div className="icon-order-currency">{leftsideSymbol}</div>}

            {(blockieimage && hasBlockieImage) && (
                <div className="icon-blockie">
                    <img src={blockieimage} style={{ width: 28 }} alt="blockie" />
                </div>
            )}

            {((type !== BFInputType.Decimal) && isValid === true && !hasBlockieImage && valueInside) && (
                <div className="icon-order-currency" style={{ marginTop: labelText ? 19 : 'unset' }}>
                    <FaCheckCircle size={13} color={Colors.bitFlexGreenColor} />
                </div>
            )}

            {(isErrorState && errorText) && (
                <div className='BFInputFieldError' style={{ 
                    position: 'absolute', 
                    background: Colors.bitFlexRedColor, 
                    padding: 6, 
                    top: -40, 
                    whiteSpace: 'nowrap', 
                    borderRadius: 3, 
                    left: '11%' 
                }}>
                    {errorText}
                </div>
            )}
        </div>
    );
}