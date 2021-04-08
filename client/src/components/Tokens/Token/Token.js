import React from 'react';

import classes from './Token.module.css';
import Aux from '../../../hoc/Aux/Aux';

const token = ( props ) => {
    console.log('token props = ', props);

    if ( props.priceSpent ) {
        console.log('proceSpent')
    }

    return (
        <Aux>
            <div className={classes.Token__Item}>
                    <img
                        src={ props.imageSrc }
                        alt={props.description}
                        className={classes.Image}
                    />
                    <div className={classes.InfoContainer}>
                        <p>{ props.tag }</p>
                        <p>{ props.description }</p>
                        <p>{ props.initialPrice } eth.</p>
                        <p>{ props.participationPercentage }%</p>
                    </div>
                    {/* <div className={classes.buttonLike}>

                    </div> */}
            </div>
        </Aux>
    );
};

export default token;