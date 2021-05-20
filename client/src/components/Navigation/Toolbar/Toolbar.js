import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faSearch, 
    faCommentsDollar, 
    faUserAstronaut,
    // faUserCog,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

import classes from './Toolbar.module.css';

import Backdrop from '../../UI/Backdrop/Backdrop';
import Button from '../../UI/Button/Button';

const toolbar = props => (
    <header className={classes.Header}>
        <nav className={classes.Navigation}>
            <div className={classes.HomeLogo}>
                <NavLink to="/home">
                    <FontAwesomeIcon icon={faHome} size="4x"/>
                </NavLink>
            </div>

            <div className={classes.SearchContainer}>
                <input className={classes.SearchInput} type="text" 
                       placeholder="Search artworks"/>
                    <button type="submit" className={classes.SearchButton}>
                        <FontAwesomeIcon 
                            className={classes.SearchIcon} icon={faSearch} size="lg"/>
                    </button>
                    
            </div>

            <Backdrop show={ props.showDropdown } clicked={ props.closeDropdown } />
            <div className={classes.ProfileNavigationContainer}>
                {
                    props.isAuthenticated 
                    ?
                    <ul className={classes.NavigationUl}>
                        <li>
                            <FontAwesomeIcon 
                                onClick={ props.notificationsClicked }
                                className={ classes.NotificationIcon } 
                                icon={ faCommentsDollar } size="4x"
                            />
                        </li>
                        <li>
                            <div className={classes.ImageProfile}>
                                <img
                                    src={props.profileImgSrc} 
                                    alt={props.profileImgSrc}
                                    onClick={ props.profileImgClicked } />
                            </div>
                            <div 
                                onClick={props.navClicked}
                                className={[
                                    classes.DropdownProfile, props.showDropdown? classes.ShowDropdown : ''
                            ].join(' ')}>
                                <NavLink to="/profile" activeClassName={classes.active}>
                                    <FontAwesomeIcon 
                                        className={classes.ConfigIcon} icon={faUserAstronaut}/>
                                    My Profile
                                </NavLink>
                                {/* <NavLink to="/settings" activeClassName={classes.active}>
                                    <FontAwesomeIcon 
                                        className={classes.ConfigIcon} icon={faUserCog}/>
                                    Settings
                                </NavLink> */}
                                <hr className={classes.Hr}/>
                                <NavLink to="/logout">
                                    <FontAwesomeIcon 
                                        className={classes.ConfigIcon} icon={faSignOutAlt}/>
                                    Logout
                                </NavLink>
                            </div>
                        </li>
                    </ul>
                    : <div className={classes.AuthContainer}>
                        <Button btnType="Login">
                            <NavLink to="/login" activeClassName={classes.active}>
                                Login
                            </NavLink>
                        </Button>
                        <Button btnType="Register">
                            <NavLink to="/register" activeClassName={classes.active}>
                                Register
                            </NavLink>
                        </Button>
                    </div>
                }
            </div>
        </nav>
    </header>
);

export default toolbar;