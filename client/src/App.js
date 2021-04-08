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

class App extends React.Component {

    componentDidMount() {
        // get user
        this.props.onTryAutoSignup();
    }

    render() {
        console.log('isAuthenticated = ', this.props.isAuthenticated);

        let routes = (
            <Switch>
                <Redirect from="/" to="/auth" exact />
                <Route path="/auth" component={Auth} />
                <Route path="/home" component={Home} />
            </Switch>
        );

        if (this.props.isAuthenticated) {
            routes = (
                <Switch>
                    <Redirect from="/" to="/home" exact />
                    <Redirect from="/auth" to="/home" exact />
                    <Route path="/home" component={Home} />
                    <Route path="/profile" component={Profile} />
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
    return {
        isAuthenticated: state.auth.idToken !== null,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onTryAutoSignup: () => dispatch(actions.authCheckState()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));