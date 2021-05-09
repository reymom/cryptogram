import React from 'react';
import { connect } from 'react-redux';
// import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

import classes from './Auth.module.css';
import * as actions from '../../store/actions/index';
import { updateObject, checkValidity } from '../../shared/utility';

import Input from '../../components/UI/Input/Input';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';

class Auth extends React.Component {
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: { type: 'email', placeholder: 'Email address' },
                value: '',
                validation: { required: true, isEmail: true },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: { type: 'password', placeholder: 'Password' },
                value: '',
                validation: { required: true, minLength: 6 },
                valid: false,
                touched: false
            },
            repeatPassword: {
                elementType: 'repeatPassword',
                elementConfig: { type: 'password', placeholder: 'Repeat password' },
                value: ['', ''],
                validation: { matchPassword: false },
                valid: false,
                touched: false
            },
            name: {
                elementType: 'input',
                elementConfig: { type: 'text', placeholder: 'User name' },
                value: '',
                validation: { required: false, minLength: 1, maxLength: 50 },
                valid: false,
                touched: false
            },
            myEthereum: {
                elementType: 'select',
                label: 
                    'YOUR ETHEREUM ACCOUNT. ' +
                    '\n By default, we create and handle your ethereum wallet. ' +
                    'You can select "Import from seed" to recover an existing address ' +
                    'Or select "Inject from browser" if you prefer to use Metamask or similar. ' +
                    'Either way you can change the address management in your settings later.'
                ,
                elementConfig: { 
                    type: 'select', 
                    placeholder: 'Ethereum Account',
                    options: [
                        {
                            value: 'custom',
                            displayValue: 'Create automatically'
                        },
                        {
                            value: 'seed',
                            displayValue: 'Import from seed'
                        },
                        {
                            value: 'browserInjection', 
                            displayValue: 'Inject from browser'
                        }
                    ]
                },
                value: 'custom', // default value
                validation: { required: false },
                valid: true,
                touched: true
            },
            seeds: {
                elementType: 'input',
                elementConfig: { type: 'textarea', placeholder: 'Your seeds' },
                value: '',
                validation: { required: false, isSeed: true },
                valid: false,
                touched: false
            },
        },
        isLogin: true
    }

    componentDidMount() {
        let nextUrl = '/profile';
        if ( this.props.history.location.pathname.includes('/register') ) {
            nextUrl = '/settings';
            this.switchPasswordValidation();
        }
        this.props.onSetAuthRedirectPath(nextUrl);
    }

    switchPasswordValidation = () => {
        this.setState(prevState => ({
            ...prevState,
            isLogin: !prevState.isLogin,
            controls: {
                ...prevState.controls,
                repeatPassword: {
                    ...prevState.controls.repeatPassword,
                    validation: { 
                        ...prevState.controls.repeatPassword.validation,
                        matchPassword: !prevState.controls.repeatPassword.validation.matchPassword
                    }
                },
                name: {
                    ...prevState.controls.name,
                    validation: { 
                        ...prevState.controls.name.validation,
                        required: !prevState.controls.name.validation.required, 
                    }
                },
                myEthereum: {
                    ...prevState.controls.myEthereum,
                    validation: { 
                        ...prevState.controls.myEthereum.validation,
                        required: !prevState.controls.myEthereum.validation.required, 
                    }
                },
            }
        }));
    }

    switchAuthModeHandler = () => {
        let pathname = '/register';
        if ( this.props.history.location.pathname.includes('/register') ) {
            pathname = '/login';
        }
        this.switchPasswordValidation();
        this.props.history.push({ pathname: pathname});
    }

    inputChangedHandler = ( event, controlName ) => {
        let value = event.target.value;
        if ( controlName === 'repeatPassword' ) {
            value = [event.target.value, this.state.controls.password.value];
        }

        const updatedControls = updateObject( this.state.controls, {
            [controlName]: updateObject( this.state.controls[controlName], {
                value: value,
                valid: checkValidity( value, this.state.controls[controlName].validation ),
                touched: true
            } )
        } );

        if ( controlName === 'myEthereum' && event.target.value === 'seed' ) {
            this.setState( { 
                controls: { 
                    ...updatedControls,
                    seeds: {
                        ...updatedControls.seeds,
                        validation: {
                            ...updatedControls.seeds.validation,
                            required: true
                        },
                    }
                }
            } );
        } else if ( controlName === 'myEthereum' && event.target.value !== 'seed' ) {
            this.setState( { 
                controls: { 
                    ...updatedControls,
                    seeds: {
                        ...updatedControls.seeds,
                        value: '',
                        validation: {
                            ...updatedControls.seeds.validation,
                            required: false
                        }
                    }
                }
            } );
        }
        else {
            this.setState( { controls: updatedControls } );
        }
    }

    submitHandler = ( event ) => {
        event.preventDefault();

        let myEthereum = 'custom';
        let seeds = '';
        if ( this.state.controls.myEthereum.value === 'browserInjection') {
            myEthereum = 'browserInjection';
        } else if ( this.state.controls.myEthereum.value === 'seed' ) {
            seeds = this.state.controls.seeds.value;
        }

        this.props.onAuth(
            this.state.controls.email.value,
            this.state.controls.password.value,
            this.state.isLogin,
            this.state.controls.name.value,
            myEthereum,
            seeds
        );
    }

    render () {
        const formElementsArray = [];
        for ( let key in this.state.controls ) {
            if (key !== 'repeatPassword' && key !== 'name' && key !== 'myEthereum' && key !== 'seeds') {
                formElementsArray.push( {
                    id: key,
                    config: this.state.controls[key]
                } )
            } else if ( 
                !this.state.isLogin && ( key !== 'seeds' ||
                (key === 'seeds' && this.state.controls['myEthereum'].value === 'seed') )
            ) {
                formElementsArray.push( {
                    id: key,
                    config: this.state.controls[key]
                } );
            }
        }

        let form = formElementsArray.map( formElement => (
            <Input
                key={formElement.id}
                label={formElement.config.label}
                elementType={formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                changed={( event ) => this.inputChangedHandler( event, formElement.id )} />
        ) );

        if ( this.props.loading ) {
            form = <Spinner />;
        }

        let errorMessage = null;
        if ( this.props.error ) {
            let errorText = '';
            switch ( this.props.error.message ) {
                case ('EMAIL_EXISTS'):
                    errorText = 'This email is already in use.';
                    break;
                case ('TOO_MANY_ATTEMPTS_TRY_LATER'):
                    errorText = 'Too many attempts, please try later.';
                    break;
                case ('EMAIL_NOT_FOUND'):
                    errorText = 'This email is not registered yet.';
                    break;
                case ('INVALID_PASSWORD'):
                    errorText = 'Incorrect password, please try again.'
                    break;
                default:
                    errorText = this.props.error.message;
            }

            errorMessage = (
                <p className={classes.ErrorText}>{ errorText }</p>
            );
        }

        // let authRedirect = null;
        // console.log('this.props.isAuthenticated = ', this.props.isAuthenticated);
        // console.log('token = ', this.props.idToken);
        // console.log('userId = ', this.props.userId);
        // if ( this.props.isAuthenticated ) {
        //     authRedirect = <Redirect to={ this.props.authRedirectPath }/>
        // }

        let submitButton = <Button />;
        let changeModeButton = <Button />;
        if (this.state.isLogin) {
            submitButton = <Button btnType='Login'>
                LOG IN
            </Button>
            changeModeButton = <Button 
                clicked={this.switchAuthModeHandler}
                btnType="Danger">
                    CREATE NEW ACCOUNT
            </Button>
        } else {
            submitButton = <Button btnType='Register'>
                CREATE ACCOUNT
            </Button>
            changeModeButton = <Button 
                clicked={this.switchAuthModeHandler}
                btnType="Danger">
                    I ALREADY HAVE AN ACCOUNT
            </Button>
        }

        return (
            <div className={classes.AuthContainer}>
                <h1>Welcome to Cryptogram</h1>
                {/* { authRedirect } */}
                <form onSubmit={this.submitHandler}>
                    { form }
                    { errorMessage }
                    { submitButton }
                </form>
                <hr className={classes.Hr}/>
                { changeModeButton }
            </div>
        );
    };
}

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        userId: state.auth.userId,
        idToken: state.auth.idToken,
        isAuthenticated: state.auth.idToken !== null,
        authRedirectPath: state.auth.authRedirectPath
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: ( email, password, isLogin, name, myEthereum, seeds ) => dispatch(
            actions.auth(email, password, isLogin, name, myEthereum, seeds)
        ),
        onSetAuthRedirectPath: ( url ) => dispatch(actions.setAuthRedirectPath(url)),
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( withRouter(Auth) );