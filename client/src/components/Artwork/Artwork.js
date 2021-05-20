import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCoins } from '@fortawesome/free-solid-svg-icons';

import classes from './Artwork.module.css';
import Aux from '../../hoc/Aux/Aux';

const artwork = ( props ) => {

    // if ( props.priceSpent > 0 ) {
    //     console.log('priceSpent');
    // }

    const decimalCount = num => {
        const numStr = String(num);
        if (numStr.includes('.')) {
            return numStr.split('.')[1].length;
        };
        return 0;
    }

    const priceInEuros = (parseFloat(props.currentPrice) * parseFloat(props.ethereumToEuro)).toFixed(2);

    return (
        <Aux>
            <div className={classes.Token__Item} onClick={ props.clicked }>
                <img
                    src={ props.imageSrc }
                    alt={ props.description }
                    className={ classes.Image }
                />
                <div className={classes.InfoContainer}>
                    <h1 style={ {marginBottom:"0"} }>{ props.tag }</h1>
                    <h2>{ props.description }</h2>
                    <div className={classes.InformationTable}>
                        <p>
                            <FontAwesomeIcon icon={faCoins} size="sm" color='rgb(66, 196, 66)'/>
                        </p>
                        <div>
                            <p>{ 
                                decimalCount(parseFloat(props.currentPrice)) > 2 ?
                                parseFloat(props.currentPrice).toFixed(2) :
                                props.currentPrice
                            } eth</p>
                            <p>{ priceInEuros }€</p>
                        </div>
                        <p>Share</p>
                        <div><p>{ props.participationPercentage }%</p></div>
                    </div>
                    <div className={classes.InformationFooter}>
                        <FontAwesomeIcon icon={faHeart} size="2x" color='rgb(196, 66, 66)'/> <p>{ props.totalLikes }</p>
                    </div>
                </div>
            </div>
        </Aux>
    );
};

export default artwork;