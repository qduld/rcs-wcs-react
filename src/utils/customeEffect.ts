import { useEffect , useRef } from 'react';

const usePrevious=(value:any)=>{
    let ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
}

export default usePrevious