import React from 'react';
import { connect } from 'react-redux';

import classes from './EditProfile.module.css';
import * as actions from '../../store/actions';
import { checkValidity } from '../../shared/utility';

import Aux from '../../hoc/Aux/Aux';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';

class EditProfile extends React.Component {
    state = {
        IPFSError: false,
        selectedFile: null,
        fileSrc: '',
        form: {
            image: {
                elementType: 'input',
                elementConfig: { type: 'file' },
                value: '',
                validation: { required: false },
                valid: true,
                touched: false
            },
            name: {
                elementType: 'input',
                elementConfig: { type: 'text', placeholder: 'Edit name...' },
                value: '',
                validation: { required: true, minLength: 1, maxLength: 50 },
                valid: false,
                touched: false
            },
            description: {
                elementType: 'input',
                elementConfig: { type: 'text', placeholder: 'Edit description...' },
                value: '',
                validation: { required: true, minLength: 1, maxLength: 100 },
                valid: false,
                touched: false
            },
        },
        formIsValid: false,
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedForm = {
            ...this.state.form
        };
        const updatedFormElement = {
            ...updatedForm[inputIdentifier]
        };
        // particular case for images
        if (inputIdentifier === 'image') {
            this.props.onGetIPFS();
            var reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onloadend = function(event) {
                this.setState({
                    fileSrc: [reader.result]
                })
            }.bind(this);
            this.setState(prevState => ({
                ...prevState,
                selectedFile: event.target.files[0]
            }));
        }
        updatedFormElement.value = event.target.value;
        
        updatedFormElement.valid = checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation
        );
        updatedFormElement.touched = true;
        updatedForm[inputIdentifier] = updatedFormElement;

        let formIsValid = true;
        for (let inputIdentifier in updatedForm) {
            formIsValid = updatedForm[inputIdentifier].valid && formIsValid;
        }
        this.setState({ form: updatedForm, formIsValid: formIsValid });
    }

    editProfileHandler = async (event) => {
        event.preventDefault();

        let data = {
            name: this.state.form['name'].value,
            description: this.state.form['description'].value
        }

        if (this.state.selectedFile) {
            const file = await this.props.IPFSInstance.add(this.state.selectedFile);
            if ( file.path ) {
                data.imageSrc = file.path;
            } else {
                this.setState({ IPFSError: true })
            }
        }

        this.props.onEditProfile(this.props.userId, this.props.idToken, data)
        this.setState({ selectedFile: null, fileSrc: '' });
        this.props.clickSubmitProfileEdit();
    }

    render() {
        const formElementsArray = [];
        for (let key in this.state.form) {
            formElementsArray.push({
                id: key,
                config: this.state.form[key]
            });
        }
        let defaultInfo = [this.props.profileUserName, this.props.profileDescription];
        let form = (
            <form onSubmit={this.editProfileHandler}>
                { formElementsArray.map((formElement, index) => {
                    let defaultValue;
                    if (index > 0) {
                        defaultValue = 
                            <div className={classes.DefaultInputInfo}>
                                { defaultInfo[index - 1] }
                            </div>
                    }
                    return (
                        <Aux key={ formElement.id }>
                            { defaultValue }
                            <Input
                                elementType={ formElement.config.elementType }
                                elementConfig={ formElement.config.elementConfig }
                                value={ formElement.config.value }
                                invalid={ !formElement.config.valid }
                                shouldValidate={ formElement.config.validation }
                                touched={ formElement.config.touched }
                                changed={ (event) => this.inputChangedHandler(event, formElement.id) }
                            />
                        </Aux>
                    );
                }) }
                <div className={classes.CenterButtons}>
                    <Button btnType="Success" disabled={ !this.state.formIsValid }>
                        EDIT
                    </Button>
                    <Button type="button" btnType="Danger" clicked={this.props.clickCancel}>
                        CANCEL
                    </Button>
                </div>
            </form>
        );

        let IPFSError = '';
        if ( this.state.IPFSError ) {
            IPFSError = <div>UPS! could not upload image to IPFS</div>
        }

        let imageSrc;
        if ( this.state.selectedFile) {
            imageSrc = this.state.fileSrc;
        } else if ( this.props.profileImageSrc ) {
            imageSrc = 'https://ipfs.io/ipfs/' + this.props.profileImageSrc;
        }

        let imageLoaded;
        if (imageSrc) {
            imageLoaded = 
                <img className={ classes.LoadedImage } src={ imageSrc } alt='Profile Pic'/>
        }

        return (
            <Aux>
                { imageLoaded }
                { form }
                { IPFSError }
            </Aux>
        );
    };
}

const mapStateToProps = state => {
    return {
        // auth info
        userId: state.auth.userId,
        idToken: state.auth.idToken,
        // IPFS instance
        IPFSInstance: state.IPFS.IPFSInstance,
        loadingIPFS: state.IPFS.loadingIPFS,
        // firebase profile
        loadingEdit: state.firebaseProfile.loading,
        errorEdit: state.firebaseProfile.errorEdit
    };
};

const mapDispatchToProps = dispatch => ({
    onGetIPFS: () => dispatch(actions.getIPFS()),
    onEditProfile: (fromUserId, idToken, data) => dispatch(
        actions.editProfile(fromUserId, idToken, data)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )(EditProfile);