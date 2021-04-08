import React from 'react';

import loadingLogo from '../../../assets/ethLogo.jpeg';
import classes from './Spinner.module.css';

const spinner = () => (
    <div className={classes.Loading}>
        <img className={classes.Spinner} src={loadingLogo} alt='Loading...'/>
    </div>
);

export default spinner;
