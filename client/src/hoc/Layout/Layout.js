import React from 'react';
import { connect } from 'react-redux';

import classes from './Layout.module.css';

import Aux from '../Aux/Aux';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
// import Footer from '../../components/Navigation/Footer/Footer';

class Layout extends React.Component {
    render () {
        return (
            <Aux>
                <Toolbar isAuthenticated={this.props.isAuthenticated}/>
                <main className={ classes.Content }>
                    { this.props.children }
                </main>
                {/* <Footer /> */}
            </Aux>
        )
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.idToken !== null
    };
};

export default connect( mapStateToProps )( Layout );