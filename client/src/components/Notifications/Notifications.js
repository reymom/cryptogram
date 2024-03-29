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

    let claimingFunds;
    if (props.claimingFunds) {
        claimingFunds = <div className={classes.ClaimingFunds}>
            Verifying transaction, please wait...
        </div>
    }

    let errorClaimFunds;
    if (props.errorClaimFunds) {
        errorClaimFunds = <div className={classes.ClaimingFunds}>
            UPS, could not complete the transaction.
        </div>
    }

    const decimalCount = num => {
        const numStr = String(num);
        if (numStr.includes('.')) {
            return numStr.split('.')[1].length;
        };
        return 0;
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
                    { props.isManager ? <p style={{ color:"#b43030", fontSize:"20px"}}>MANAGER</p> : ''}
                </div>

                <hr className={classes.Hr}/>
                <Button 
                    btnType="Register"
                    clicked={ props.buyEtherClicked } 
                >
                    Buy ether
                </Button>
                <div className={classes.Balances}>
                    <div>Balance</div><span>{ 
                        decimalCount(parseFloat(props.ethBalance)) > 2 ?
                        parseFloat(props.ethBalance).toFixed(2) :
                        props.ethBalance
                    } eth</span>
                    <div>Available Funds</div><span>{ props.availableFunds } eth</span>
                    {
                        props.isManager ? <div>Locked Funds</div> : ''
                    }
                    {
                        props.isManager ? <span>{ props.lockedFunds } eth</span> : ''
                    }
                </div>
                <Button 
                    btnType="Login" 
                    clicked={ props.claimRewardsClicked } 
                    disabled={
                        (props.availableFunds.toString() === "0" && props.lockedFunds.toString() === "0")
                        || props.ethBalance.toString() === "0"
                    }
                >
                    Get funds
                </Button>
                { claimingFunds }
                { errorClaimFunds }
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