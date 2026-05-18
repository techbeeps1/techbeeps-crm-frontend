import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './satoshi.css';
import store from './pages/Redux/store';
import { EmailProvider } from './EmailProvider/EmailContext';
import { UserContextProvider } from './UserContext';


function Root() {
  return (
    <>
      <Provider store={store}> <App /> </Provider>
    </>
  );
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <EmailProvider>
    <UserContextProvider>
      <React.StrictMode>
        <Router>
          <Root />
        </Router>
      </React.StrictMode>
    </UserContextProvider>
  </EmailProvider>
);
