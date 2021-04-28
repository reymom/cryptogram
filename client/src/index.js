import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { 
    createStore, 
    applyMiddleware, 
    compose, 
    combineReducers 
} from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import App from './App';
// import reportWebVitals from './reportWebVitals';
import artworkReducer from './store/reducers/artwork';
import authReducer from './store/reducers/auth';
import contractEventsReducer from './store/reducers/contractEvents';
import firebaseProfileReducer from './store/reducers/firebaseProfile';
import IPFSReducer from './store/reducers/IPFS';
import web3AddressReducer from './store/reducers/web3Address';
import web3ObjectsReducer from './store/reducers/web3Objects';

import './index.css';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
    artwork: artworkReducer,
    auth: authReducer,
    contractEvents: contractEventsReducer,
    firebaseProfile: firebaseProfileReducer,
    IPFS: IPFSReducer,
    web3Address: web3AddressReducer,
    web3Objects: web3ObjectsReducer
});

const store = createStore( rootReducer, composeEnhancers(applyMiddleware(thunk)) );

const app = (
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);

ReactDOM.render(
    <React.StrictMode>
        { app }
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
