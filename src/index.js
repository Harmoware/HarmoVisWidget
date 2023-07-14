import { render } from 'react-dom';
import { getConfigureStore } from 'harmoware-vis';
import { Provider } from 'react-redux';
import React from 'react';
import App from './containers/app';
import 'harmoware-vis/scss/harmoware.scss';
import './scss/local.scss';


export default class {
  create(props){
    const {container,...otherProps} = props
    const store = getConfigureStore();
    render(
      <Provider store={store}>
        <App widgetParam={{...otherProps}} />
      </Provider>,
      container
    )
  }
}