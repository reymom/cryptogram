import React from 'react';

import classes from './Notifications.module.css';
import Backdrop from '../UI/Backdrop/Backdrop';
import Aux from '../../hoc/Aux/Aux';

const notifications = ( props ) => {
    let attachedClasses = [classes.SideDrawer, classes.Close];
    if (props.open) {
        attachedClasses = [classes.SideDrawer, classes.Open];
    }

    return (
        <Aux>
            <Backdrop show={props.open} clicked={props.closed}/>
            <div className={attachedClasses.join(' ')}>
                <div className={classes.ImageProfile}>
                    <img src={props.profileImgSrc} alt={props.profileImgSrc} />
                    <h3>{props.profileInfo.name}</h3>
                </div>
                <hr className={classes.Hr}/>
                <div className={classes.EthBalanceContainer}>
                    <p>Balance | <b>{ props.ethBalance }</b> eth </p>
                </div>
                <div className={classes.AvailableFundsContainer}>
                    <p>Available Funds | <b>{ props.availableFunds }</b> eth 
                        <button 
                            className={classes.RewardsButton}
                            onClick={props.clicked} >
                            Get funds
                        </button>
                    </p>
                </div>
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