import { ApiMarket, ApiPair, ApiTickers, GetApiMarketsCurrenciesResponse } from '../../api-wrapper/api';
/* eslint-disable @typescript-eslint/no-array-constructor */
import { FaSearch, FaStar } from "react-icons/fa";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans, useTranslation } from 'react-i18next';

import { ActionType } from '../../store/actionTypes';
import { BFPortlet } from '../html/BFPortlet';
import { ICurrentMarketState } from '.';
import { Store } from "../../store/index";
import fromExponential from 'from-exponential';
import loading_png from '../../images/loading.svg'
import { useCallback } from 'react';
import { useForceUpdate } from '../../hooks/useForceUpdate';
// import { useForceUpdate } from '../../hooks/useForceUpdate';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSignalR } from '../../hooks/useSignalR';

export interface IDigitCount {
  wholePlaces: number;
  decimalPlaces: number;
}

export interface IFavMarket {
  id: string;
}

export function formatDigits(value: number, currency?: string) {
  // return 
  if (isNaN(value)) return '...';
  if (value === 0) return value.toFixed(8)
  var absValue = Math.abs(value); // -15.555 becomes 15.555
  var wholePlaces = 0;
  for (; wholePlaces <= 308; ++wholePlaces) { // Number.MAX_VALUE is 1.798e+308
    if (absValue < Math.pow(10, wholePlaces))
      break;
  }

  var decimalValue = absValue - Math.floor(absValue); // 15.555 - 15 = 0.555
  var decimalPlaces = 0;
  for (; decimalPlaces >= -323; --decimalPlaces) { // Number.MIN_VALUE is 5e-324
    var temp = (decimalValue / Math.pow(10, decimalPlaces)) + 0.09; // Adding 0.09 to counter float errors
    if (temp - Math.floor(temp) < 0.1)  // If the decimal remaining is smaller that 0.1, we've reached the end
      break;
  }
  decimalPlaces = Math.abs(decimalPlaces);

  var returnValue = parseFloat(fromExponential(value))
  var stringReturn;
  switch (wholePlaces) {
    case 6: stringReturn = returnValue.toFixed(2); break;
    case 5: stringReturn = returnValue.toFixed(3); break;
    case 4: stringReturn = returnValue.toFixed(4); break;
    case 3: stringReturn = returnValue.toFixed(5); break;
    case 2: stringReturn = returnValue.toFixed(6); break;
    case 1: stringReturn = returnValue.toFixed(7); break;
    case 0: stringReturn = returnValue.toFixed(8); break;

    default: stringReturn = returnValue.toFixed(8); break;
  }
  if (currency)
    stringReturn += ' ' + currency?.toUpperCase();
  return stringReturn;
}

const RenderMarketTabs = ({
  markets,
  isLoading,
  isError,
  tickers,
  currentMarket,
  setCurrentMarket,
  currencies
}: {
  markets: Array<ApiMarket>,
  // dispatch_markets: React.Dispatch<{ type: any; value: any }>
  isLoading?: Boolean,
  isError?: Boolean,
  tickers: Array<ApiTickers>,
  currentMarket: ICurrentMarketState | undefined,
  setCurrentMarket,
  currencies: Array<GetApiMarketsCurrenciesResponse>
}): JSX.Element => {

  const {
    dispatch
  } = useContext(Store);


  var pairTrRef = useRef(Array())
  const forceUpdate = useForceUpdate();

  const { OnTicker } = useSignalR();
  const { t } = useTranslation();

  const [currentMarketIndex, setcurrentMarketIndex] = useLocalStorage('market', 1);
  const [favMarkets, setfavMarkets] = useLocalStorage('favMarkets', Array<IFavMarket>());
  const [searchString, setsearchString] = useState('');

  const [allPairsArray, setallPairsArray] = useState<Array<ApiPair>>([]);

  let marketCount = 2;

  useEffect(() => {
    if (!OnTicker || !dispatch || !tickers) return;

    OnTicker((pair, price, quote, change) => {
      var tickersProxy = tickers as Array<ApiTickers>
      var itemIndex = tickersProxy.findIndex(item => item.pair === pair);
      var oldPrice = tickersProxy[itemIndex].price;

      tickersProxy[itemIndex].price = price;
      tickersProxy[itemIndex].change = change;
      tickersProxy[itemIndex].usdPrice = 0;

      dispatch({ type: ActionType.FETCH_TICKERS, payload: tickersProxy });

      if (!oldPrice) return;

      if (oldPrice > price) {
        pairTrRef.current[pair]?.classList.add("tr-highlight-red");
        setTimeout(() => {
          pairTrRef.current[pair]?.classList.remove("tr-highlight-red");
        }, 333)
      }

      if (price > oldPrice) {
        pairTrRef.current[pair]?.classList.add("tr-highlight-green");
        setTimeout(() => {
          pairTrRef.current[pair]?.classList.remove("tr-highlight-green");
        }, 333)
      }
    })
  }, [OnTicker, dispatch, tickers])

  useEffect(() => {
    var emptyPairList: Array<ApiPair> = [];
    markets.forEach((market) => {
      emptyPairList = [...emptyPairList, ...market.pairs!];
    })

    setallPairsArray(emptyPairList)
  }, [markets])

  var countDecimals = function (value) {
    try {
      if (Math.floor(value) === value) return 0;
      return value.toString().split(".")[1].length || 0;
    } catch {
      console.warn('countDecimals', value)
      return 0;
    }
  }

  const getColor = useCallback((change) => {
    if (Number(change) === 0) return '#bdbdbd';
    return change > 0 ? '#35CB3Baa' : '#E03C2D';
  }, []);


  const RenderPair = useCallback((market: ApiMarket | null, pair: ApiPair) => {
    if (!currencies) return <></>
    var currencyIn = currencies.find(x => x.symbol === pair.symbol);

    console.log("pair", pair);

    // console.log("cyrrency IN", JSON.stringify(currencyIn))
    // if (!currencyIn) return <>YOH</>;
    var ticker = tickers!.find(x => x.pair === pair.pair);
    if (!ticker) ticker = { price: 0, change: 0 };

    var tickerPrice = ticker.price;
    ticker.price = Number(ticker.price)
    var decimals, needToAdd, change;

    if (ticker) {
      decimals = '';
      needToAdd = 8 - countDecimals(parseFloat(ticker.price.toFixed(8)));
      change = ticker.change

      for (var step = needToAdd; step > 0; step--) decimals += '0'
      if (needToAdd === 8) decimals = '.' + decimals;
    }

    var isFav = false;
    if (favMarkets) {
      if (favMarkets.find(x => x === pair.id))
        isFav = true
    }

    var symbol = ''

    if (market)
      symbol = market.symbol!;
    else
      symbol = pair.pair?.split('_')[1]!

    const onStarClick = () => {

      if (favMarkets) {
        if (!isFav) {
          favMarkets.push(pair.id);
          isFav = true;
        }
        else {
          favMarkets.splice(favMarkets.indexOf(pair.id), 1)
          isFav = false
        }
      }
      setfavMarkets(favMarkets)
      forceUpdate()

    }

    return (
      <tr ref={el => pairTrRef.current[pair.id!] = el} className={currentMarket?.pairId === pair.id ? 'marketTab-active' : 'marketTab-inactive'} key={pair.id} style={{ cursor: 'pointer' }}>
        <td className='tdFix' style={{ width: '6%' }} onClick={onStarClick}>
          <FaStar className={isFav ? "star-active" : "star-inactive"} style={{ zIndex: 9999, paddingTop: 2 }} />
        </td>
        <td className='tdFix' style={{ textAlign: 'left' }} onClick={() => setCurrentMarket(pair.id, pair.pair, pair.symbol, symbol)}>
          <div style={{ display: 'flex', flexDirection: 'row', height: 30, alignItems: 'center' }}>
            <div style={{ marginRight: 5, paddingTop: 4 }}><img alt="image1" style={{ maxHeight: 20, paddingBottom: 0 }} src={currencyIn?.imageBase64!} /></div>
            <span>{market ? pair.symbol : pair.pair}</span> {pair.leverage! > 0 && <span className="tab-margin-box">{pair.leverage}x</span>}
          </div>
        </td>
        <td className='tdFix' style={{ textAlign: 'right' }} onClick={() => setCurrentMarket(pair.id, pair.pair, pair.symbol, symbol)}>
          <span className={'marketTab-price-number font-roboto-condensed'}>{tickerPrice}</span><span className={'marketTab-price-decimal'}>{decimals}</span>
          <br />
          <span className={'font-roboto-condensed'} style={{ textAlign: 'left', color: getColor(change) }}>{change.toFixed(2)}%</span>
        </td>
      </tr>
    )
  }, [currencies, currentMarket?.pairId, favMarkets, getColor, setCurrentMarket, setfavMarkets, tickers]);

  const RenderFavMarketList = useCallback(() => {
    return <table className="table table-striped" style={{ height: '100%' }}>
      <thead>
        <tr>
          <th className='thFix' style={{ width: '8%', paddingTop: 12 }}><FaStar /></th>
          <th className='thFix' style={{ textAlign: 'left' }}><Trans>Currency</Trans></th>
          <th className='thFix' style={{ textAlign: 'right' }}><Trans>Price</Trans> / <Trans>Change %</Trans></th>
        </tr>
      </thead>
      <tbody>
        {allPairsArray.map(pair => {
          // console.log("allPairsArray.map(pair",pair)
          var index = favMarkets.findIndex(_ => _ === pair.id!)
          if (index !== -1)
            return RenderPair(null, pair);
        })}
      </tbody>
    </table>
  }, [RenderPair, allPairsArray, favMarkets])

  const RenderSearchMarkets = useCallback(() => {
    return <table className="table table-striped" style={{ height: '100%' }}>
      <thead>
        <tr>
          <th className='thFix' style={{ width: '8%', paddingTop: 12 }}><FaStar /></th>
          <th className='thFix' style={{ textAlign: 'left' }}><Trans>Currency</Trans></th>
          <th className='thFix' style={{ textAlign: 'right' }}><Trans>Price</Trans> / <Trans>Change %</Trans></th>
        </tr>
      </thead>
      <tbody>
        {allPairsArray.filter(s => s.pair!.toLowerCase().includes(searchString.toLowerCase())).map(pair => {
          return RenderPair(null, pair);
        })}
      </tbody>
    </table>
  }, [RenderPair, allPairsArray, searchString])

  const RenderMarketList = useCallback(() => {
    if (!markets || !currencies || !tickers || !currentMarket) return;

    return markets.map(market => {

      marketCount++;

      return <TabPanel>
        <table className="table table-striped" style={{ height: '100%' }}>
          <thead>
            <tr>
              <th className='thFix' style={{ width: '8%', paddingTop: 12, paddingLeft: 10 }}><FaStar /></th>
              <th className='thFix' style={{ textAlign: 'left' }}><Trans>Currency</Trans></th>
              <th className='thFix' style={{ textAlign: 'right' }}><Trans>Price</Trans> / <Trans>Change %</Trans></th>
            </tr>
          </thead>
          <tbody>
            {market.pairs?.map(pair => {
              return RenderPair(market, pair);
            })}
          </tbody>
        </table>
      </TabPanel>
    })
  }, [markets, currencies, tickers, currentMarket, RenderPair])


  const SecondTitleComponentSearch = useCallback((): JSX.Element => {
    return <div className="portlet-title draggable" style={{
      padding: 0, margin: 0, display: 'flex', justifyContent: 'space-between',
      borderBottomWidth: 1, borderBottomColor: 'rgb(39, 39, 42)', borderBottomStyle: 'solid',
      // marginBottom: -2
    }}>
      <FaSearch style={{ margin: 'auto', color: '#bdbdbd', marginLeft: 10 }} />
      <input onChange={e => {
        var value = e.target.value;
        if (value.length > 0) {
          setsearchString(e.target.value)
          setcurrentMarketIndex(marketCount - 1)
        }
        else {
          setsearchString(e.target.value)
          setcurrentMarketIndex(1)
        }
      }} type="search" id="search" className="form-control input-inline search-bf" placeholder="Search Markets..." style={{ width: '100%', padding: 5, fontSize: 14, paddingLeft: 12, background: 'transparent', border: 0, color: 'white' }} />
    </div>
  }, [marketCount, setcurrentMarketIndex]);

  return (
    <BFPortlet title={t('Markets')}
      isLoading={isLoading}
      isError={isError}
      isScrollable={false}
      secondTitleComponent={SecondTitleComponentSearch()}>
      <Tabs
        className='tabbable-custom dontDragMe'
        selectedIndex={currentMarketIndex}
        onSelect={(index) => {
          setcurrentMarketIndex(index)
        }}

      >
        <TabList>
          <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '10%', display: favMarkets.length === 0 ? 'none' : '' }}><FaStar className="star-active" style={{ margin: 'auto', paddingTop: 2 }} /></Tab>
          {markets.map(market => (
            <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33.33333%', fontSize: 17 }}>{market.symbol}</Tab>
          ))}
          <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: 35, display: searchString.length === 0 ? 'none' : '' }}><FaSearch style={{ margin: 'auto', color: '#bdbdbd', paddingTop: 2 }} /></Tab>
        </TabList>
        <TabPanel>
          {RenderFavMarketList()}
        </TabPanel>

        {RenderMarketList()}
        <TabPanel>
          {RenderSearchMarkets()}
        </TabPanel>
      </Tabs>
    </BFPortlet>
  );
}


const MarketTabs = React.memo(RenderMarketTabs)
export { MarketTabs };