import React from 'react';

import classes from './KanbanTokens.module.css';
import Token from '../Token/Token';

const kanbanTokens = ( props ) => {
    console.log('kanbanTokens, artworks = ', props.artworks);
    return (<div className={classes.KanbanContainer}>
        {
            props.artworks.map(artwork => (
                <Token
                    key={ artwork.IPFShash }
                    imageSrc={ 'https://ipfs.io/ipfs/' + artwork.IPFShash }
                    creationDate={ artwork.creationDate }
                    lastPurchaseDate={ artwork.lastPurchaseDate }
                    priceSpent={ artwork.priceSpent }
                    description={ artwork.description }
                    tag={ artwork.tag }
                    initialPrice={ artwork.initialPrice }
                    participationPercentage={ artwork.participationPercentage }
                    totalLikes={ artwork.totalLikes }
                    onClick={props.clicked} />
                )
            )
        }
    </div>);
};

export default kanbanTokens;