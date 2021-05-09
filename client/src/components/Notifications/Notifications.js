import React from 'react';

import classes from './Notifications.module.css';
import Backdrop from '../UI/Backdrop/Backdrop';
import Button from '../UI/Button/Button';
import Aux from '../../hoc/Aux/Aux';

const notifications = ( props ) => {
    let attachedClasses = [classes.SideDrawer, classes.Close];
    if ( props.open ) {
        attachedClasses = [classes.SideDrawer, classes.Open];
    }

    return (
        <Aux>
            <Backdrop show={props.open} clicked={props.closed}/>
            <div className={attachedClasses.join(' ')}>
                <div className={classes.ImageProfile}>
                    <img src={props.profileImgSrc} alt={props.profileImgSrc} />
                    <h3>{props.profileInfo.name}</h3>
                    <a target="_blank" rel="noreferrer" title="See on Etherscan"
                        href={'https://ropsten.etherscan.io/address/' + props.profileInfo.address} 
                        className={classes.Address}>
                            {props.profileInfo.address}
                    </a>
                </div>
                <hr className={classes.Hr}/>
                <div className={classes.Balances}>
                    <div>Balance</div><span>{ props.ethBalance } eth</span>
                    <div>Available Funds</div><span>{ props.availableFunds } eth</span>
                </div>
                <Button 
                    btnType="Login" 
                    clicked={props.clicked} 
                    disabled={
                        props.availableFunds === 0 || props.ethBalance === 0
                    }
                >
                    Get funds
                </Button>
                <hr className={classes.Hr}/>
                <div className={classes.NotificationsContainer}>
                    <h2>Notifications</h2>
                </div>
                { props.child }
            </div>
        </Aux>
    );
};

export default notifications;