import { useEffect } from 'react';
import Chat from './Chat';
import { useNavigate } from 'react-router-dom';

export default function DemoChat() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/signin');
    }
  }, [navigate, token]);

  if (token) {
    return <Chat />;
  }

  return null;
}

