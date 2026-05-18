import { useEffect } from 'react';
import Chat from './Chat.js';
import { useNavigate } from 'react-router-dom';


export default function Routes() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/signin');
    }
  }, [navigate]);

  if (token) {
    return <Chat />;
  }
}
