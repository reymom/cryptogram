import React from 'react';

import classes from './Artwork.module.css';
import Aux from '../../hoc/Aux/Aux';

const artwork = ( props ) => {

    if ( props.priceSpent > 0 ) {
        console.log('priceSpent');
    }

    return (
        <Aux>
            <div className={classes.Token__Item} onClick={ props.clicked }>
                <img
                    src={ props.imageSrc }
                    alt={ props.description }
                    className={ classes.Image }
                />
                <div className={classes.InfoContainer}>
                    <p>{ props.tag }</p>
                    <p>{ props.description }</p>
                    <p>{ props.initialPrice } eth.</p>
                    <p>{ props.participationPercentage }%</p>
                </div>
            </div>
        </Aux>
    );
};

export default artwork;