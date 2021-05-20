import React from 'react';

import classes from './LoadedHistory.module.css';
import Aux from '../../hoc/Aux/Aux';

const loadedHistory = ( props ) => {
    let content = '';
    if (props.type === 'Creation') {
        content = <div className={classes.InfoContainer}>
            <p>{ props.artwork.tag }</p>
            <p>{ props.artwork.description }</p>
            <p>{ props.artwork.initialPrice } eth.</p>
            <p>{ props.artwork.participationPercentage }%</p>
        </div>
    } else if (props.type === 'Purchase') {
        content = <div className={classes.InfoContainer}>
            <p>{ props.artwork.collector }</p>
            <p>{ props.artwork.purchasePrice }</p>
        </div>
    }

    return (
        <Aux>
            <div className={classes.ArtworkContainer} onClick={ props.clicked }>
                <div className={classes.TimeBar}>
                    <div></div>
                </div>
                <p style={{textAlign: 'center'}}>
                    { 
                        props.type === 'Creation'
                        ? props.artwork.creator
                        : props.artwork.seller
                    }
                </p>
                <img
                    src={ 'https://ipfs.io/ipfs/' + props.artwork.IPFShash }
                    alt={ 'https://ipfs.io/ipfs/' + props.artwork.IPFShash }
                    className={ classes.ArtworkImage }
                />
                { content }
            </div>
        </Aux>
    );
};

export default loadedHistory;