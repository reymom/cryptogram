import React from 'react';
import { connect } from 'react-redux';

import classes from './CreateAccount.module.css';
import * as actions from '../../../store/actions';
import { updateObject, checkValidity } from '../../../shared/utility';

import Button from '../../../components/UI/Button/Button';
import Input from '../../../components/UI/Input/Input';

class CreateAccount extends React.Component {
    state = {
        seed: {
            elementType: 'input',
            elementConfig: { type: 'text', placeholder: 'Seed' },
            value: '',
            validation: { required: true, isSeed: true },
            valid: false,
            touched: false
        }
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps) {
        if ( this.props.seed && prevProps.seed === '' ) {
          this.writeInitialSeedValue();
        }
    } 

    writeInitialSeedValue() {
        this.setState( { seed: updateObject( this.state.seed, {
                value: this.props.seed,
                valid: true,
                touched: true
            } ),
        } );
    }

    seedChangedHandler = ( event ) => {
        let updatedSeed = updateObject( this.state.seed, {
            value: event.target.value,
            valid: checkValidity( 
                event.target.value, this.state.seed.validation
            ),
        } )

        this.setState( { seed: updatedSeed } );
    }

    createAccountHandler = ( event ) => {
        event.preventDefault();
        this.props.onGetAddressFromSeed( this.state.seed.value, this.props.userId, this.props.idToken );
        this.props.clickCancel();
    }

    render() {
        let form = (
            <form onSubmit={this.createAccountHandler}>
                <Input
                    label='Introduce your seed'
                    elementType={ this.state.seed.elementType }
                    elementConfig={ this.state.seed.elementConfig }
                    value={ this.state.seed.value }
                    invalid={ !this.state.seed.valid }
                    shouldValidate={ this.state.seed.validation }
                    touched={ this.state.seed.touched }
                    changed={ ( event ) => this.seedChangedHandler( event ) }
                />
                <div className={classes.CenterButtons}>
                    <Button btnType="CreateArtwork" disabled={ !this.state.seed.valid }>
                        CREATE
                    </Button>
                    <Button type="button" btnType="Danger" clicked={this.props.clickCancel}>
                        CANCEL
                    </Button>
                </div>
            </form>
        );

        return (
            <div className={classes.CreateAccountContainer}>
                <h1>CREATE OR IMPORT AN ACCOUNT</h1>
                <h3>
                    If you want to create a new account, just click the button
                    and it will use the random seed generated and prepared for you.
                </h3>
                <h3>
                    If you want to import an existing account, 
                    subsitute the seeds by the ones of your own.
                </h3>
                { form }
            </div>
        );
    };
}

const mapStateToProps = state => {
    return {
        // auth info
        userId: state.auth.userId,
        idToken: state.auth.idToken,
        // firebase

        // web3
        seed: state.web3Objects.seed,
    };
};

const mapDispatchToProps = dispatch => ({
    onGetAddressFromSeed: ( seeds, userId, idToken ) => dispatch(
        actions.getAddressFromSeed(seeds, userId, idToken, true)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )(CreateAccount);