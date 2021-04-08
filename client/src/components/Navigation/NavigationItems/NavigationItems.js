import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';

import classes from './NavigationItems.module.css';

import NavigationItem from './NavigationItem/NavigationItem';

const navigationItems = ( props ) => (
    <nav className={classes.NavigationItems}>
        <ul>
            <NavigationItem link="/home">
                <FontAwesomeIcon className={classes.FontAwesomeIcon} icon={faHome} size="lg"/>
            </NavigationItem>

            <form action="#">
                <input type="text" placeholder="Search artworks"/>
                <button type="submit"><FontAwesomeIcon className={classes.FontAwesomeIcon} icon={faSearch} size="lg"/></button>
            </form>

            {
                props.isAuthenticated ? <NavigationItem link="/profile">Profile</NavigationItem> : null
            }
            {
                !props.isAuthenticated
                ? <NavigationItem link="/auth">Sign in</NavigationItem>
                : <NavigationItem link="/logout">Logout</NavigationItem>
            }
        </ul>
    </nav>
);

export default navigationItems;