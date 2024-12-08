import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAutoLogout = (timeout = 3000000000) => { // Default timeout is 5 minutes (300000 ms)
  const navigate = useNavigate();
  const timeoutIdRef = useRef(null);

  const resetTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      axios.defaults.headers.common['Authorization'] = '';
      navigate('/login');
    }, timeout);
  }, [navigate, timeout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    resetTimeout();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [resetTimeout]);

  return null;
};

export default useAutoLogout;