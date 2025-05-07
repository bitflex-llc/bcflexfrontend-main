import { useCallback, useState } from "react";

import queryString1 from 'query-string';


export const getQueryStringValue = ( 
    key, 
    queryString = window.location.search
) => { 

    const values = queryString1.parse(queryString); 
    return values[key];
};

function useQueryString(key, initialValue) {
    const [value, setValue] = useState(getQueryStringValue(key) || initialValue);
    const onSetValue = useCallback(
      newValue => {
        setValue(newValue);

      },
      []
    );
  
    return [value, onSetValue];
  }
  
  export default useQueryString;