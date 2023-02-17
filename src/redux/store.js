import thunk from 'redux-thunk';
import {ModalReducer} from './reducers';
import { legacy_createStore as createStore, applyMiddleware} from 'redux';

export const store = createStore(ModalReducer,applyMiddleware(thunk));