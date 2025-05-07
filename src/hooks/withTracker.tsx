import React, { useEffect } from "react";
import ReactGA from "react-ga";

ReactGA.initialize("UA-156987502-1");

export const withTracker = (WrappedComponent, options = {}): JSX.Element => {
  const trackPage = page => {
    ReactGA.set({
      page,
      ...options
    });
    ReactGA.pageview(page);
  };

  const HOC = (props): JSX.Element => {
    useEffect(() => trackPage(props.location.pathname), [
      props.location.pathname
    ]);

    return <WrappedComponent {...props} />;
  };

  return HOC as unknown as JSX.Element;
};