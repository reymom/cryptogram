import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faSearch, 
    faCommentsDollar, 
    faUserAstronaut,
    faSignInAlt,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

import classes from './Toolbar.module.css';

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

            <ul className={classes.NavigationUl}>
                <li>
                    <NavLink to="/notifications" activeClassName={classes.active}>
                        <FontAwesomeIcon 
                                className={classes.SearchIcon} icon={faCommentsDollar} size="3x"/>
                    </NavLink>
                </li>
                {
                    props.isAuthenticated 
                    ? <li>
                        <NavLink to="/profile" activeClassName={classes.active}>
                            <FontAwesomeIcon 
                                className={classes.SearchIcon} icon={faUserAstronaut} size="3x"/>
                        </NavLink>
                        </li>
                    : null
                }
                {
                    !props.isAuthenticated
                    ? <li>
                        <NavLink to="/auth" activeClassName={classes.active}>
                        <FontAwesomeIcon 
                                className={classes.SearchIcon} icon={faSignInAlt} size="3x"/>
                        </NavLink>
                    </li>
                    : <li>
                        <NavLink to="/logout" activeClassName={classes.active}>
                            <FontAwesomeIcon 
                                className={classes.SearchIcon} icon={faSignOutAlt} size="3x"/>
                        </NavLink>
                    </li>
                }

            </ul>
        </nav>
    </header>
);

export default toolbar;