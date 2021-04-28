import React from 'react';
import { BrowserRouter, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from './store/actions/index';
import './App.css';

import Layout from './hoc/Layout/Layout';
import Auth from './containers/Auth/Auth';
import Logout from './containers/Auth/Logout/Logout';
import Home from './containers/Home/Home';
import Profile from './containers/Profile/Profile';
import Settings from './containers/Settings/Settings';
import LoadedArtwork from './containers/LoadedArtwork/LoadedArtwork';

class App extends React.Component {
    componentDidMount() { this.props.onTryAutoSignup(); }

    render() {
        console.log('[App.js][render] isAuthenticated = ', this.props.isAuthenticated);

        let routes = (
            <Switch>
                <Redirect from="/" to="/login" exact />
                <Route path="/login" component={Auth} />
                <Route path="/register" component={Auth} />
                <Route path="/home" component={ Home } />
            </Switch>
        );

        if ( this.props.isAuthenticated ) {
            routes = (
                <Switch>
                    <Redirect from="/" to="/home" exact />
                    <Redirect from="/login" to="/home" exact />
                    <Redirect from="/register" to="/home" exact />
                    <Route
                        exact
                        path='/artworks/:id'
                        component={ LoadedArtwork } 
                    />
                    <Route
                        exact
                        path='/profile/artworks/:id'
                        component={ LoadedArtwork } 
                    />
                    <Route path="/home" component={Home} />
                    <Route
                        path='/user/:id'
                        component={ Profile } 
                    />
                    <Route exact path="/profile" component={Profile} />
                    <Route exact path="/settings" component={Settings} />
                    <Route path="/logout" component={Logout} />
                </Switch>
            )
        }

        return (
            <BrowserRouter>
                <Layout>
                    <main className="App-main-content">
                        { routes }
                    </main>
                </Layout>
            </BrowserRouter>
        );

    }
}

const mapStateToProps = state => {
    return { isAuthenticated: state.auth.idToken !== null };
};

const mapDispatchToProps = dispatch => {
    return { onTryAutoSignup: () => dispatch(actions.authCheckState()) };
};

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(App) );