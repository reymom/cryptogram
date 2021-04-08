import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './CreateToken.module.css';

import Aux from '../../hoc/Aux/Aux';
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import Input from '../../components/UI/Input/Input';

class CreateToken extends React.Component {
    state = {
        IPFSError: false,
        selectedFile: null,
        fileSrc: '',
        artworkForm: {
            image: {
                elementType: 'input',
                elementConfig: { type: 'file' },
                value: '',
                validation: { required: false },
                valid: false,
                touched: false
            },
            name: {
                elementType: 'input',
                elementConfig: { type: 'text', placeholder: 'Title...' },
                value: '',
                validation: { required: true, minLength: 1, maxLength: 50 },
                valid: false,
                touched: false
            },
            tag: {
                elementType: 'input',
                elementConfig: { type: 'text', placeholder: 'Tag...' },
                value: '',
                validation: { required: true, minLength: 1, maxLength: 15 },
                valid: false,
                touched: false
            },
            initialPrice: {
                elementType: 'numeric',
                elementConfig: { type: 'text', placeholder: 'Initial price...' },
                value: '',
                validation: { required: true, isFloat: true },
                valid: false,
                touched: false
            },
            participationPercentage: {
                elementType: 'input',
                elementConfig: {
                    type: 'text', placeholder: 'Participation %'
                },
                value: '',
                validation: { required: true, isInteger: true, minNum: 0, maxNum: 100 },
                valid: false,
                touched: false
            },
        },
        formIsValid: false,
    }

    componentDidMount() { this.props.onGetIPFS(); }

    checkValidity(value, rules) {
        let isValid = true;
        if (!rules) { return true; }
        if (rules.required) { isValid = value.trim() !== '' && isValid; }
        if (rules.minLength) { isValid = value.length >= rules.minLength && isValid }
        if (rules.maxLength) { isValid = value.length <= rules.maxLength && isValid }
        if (rules.isFloat) {
            const floatPattern = /^\d*(\.\d+)?$/;
            isValid = floatPattern.test(value) && isValid
        }
        if (rules.isInteger) {
            const integerPattern = /^\d+$/;
            isValid = integerPattern.test(value) && isValid
        }
        if (rules.minNum) { isValid = value >= rules.minNum && isValid }
        if (rules.maxNum) { isValid = value <= rules.maxNum && isValid }
        return isValid;
    }

    inputChangedHandler = (event, inputIdentifier) => {
        const updatedArtworkForm = {
            ...this.state.artworkForm
        };
        const updatedFormElement = {
            ...updatedArtworkForm[inputIdentifier]
        };
        // particular case for images
        if (inputIdentifier === 'image') {
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
        
        updatedFormElement.valid = this.checkValidity(
            updatedFormElement.value,
            updatedFormElement.validation
        );
        updatedFormElement.touched = true;
        updatedArtworkForm[inputIdentifier] = updatedFormElement;

        let formIsValid = true;
        for (let inputIdentifier in updatedArtworkForm) {
            formIsValid = updatedArtworkForm[inputIdentifier].valid && formIsValid;
        }
        this.setState({ artworkForm: updatedArtworkForm, formIsValid: formIsValid });
    }

    createArtworkHandler = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });

        const file = await this.props.IPFSInstance.add(this.state.selectedFile);
        if (file.path) {

            this.props.onCreateArtwork(
                this.state.artworkForm['name'].value,
                this.state.artworkForm['tag'].value,
                file.path,
                this.props.web3.utils.toWei(this.state.artworkForm['initialPrice'].value, 'ether'),
                this.state.artworkForm['participationPercentage'].value,
                this.props.accounts[0],
                this.props.contract.methods
            )

            this.setState({ selectedFile: null, fileSrc: '' });
            this.props.submitNewToken();
        } else {
            this.setState({ IPFSError: true })
        }

    }

    render() {
        let form = <Spinner />;
        if (!this.props.loadingIPFS && this.props.IPFSInstance) {
            const formElementsArray = [];
            for (let key in this.state.artworkForm) {
                formElementsArray.push({
                    id: key,
                    config: this.state.artworkForm[key]
                });
            }
            form = (
                <form onSubmit={this.createArtworkHandler}>
                    { formElementsArray.map(formElement => (
                        <Input
                            key={ formElement.id }
                            elementType={ formElement.config.elementType }
                            elementConfig={ formElement.config.elementConfig }
                            value={ formElement.config.value }
                            invalid={ !formElement.config.valid }
                            shouldValidate={ formElement.config.validation }
                            touched={ formElement.config.touched }
                            changed={ (event) => this.inputChangedHandler(event, formElement.id) }
                        />
                    )) }
                    <div className={classes.CenterButtons}>
                        <Button btnType="Success" disabled={ !this.state.formIsValid }>
                            CREATE
                        </Button>
                        <Button type="button" btnType="Danger" clicked={this.props.clickCancel}>
                            CANCEL
                        </Button>
                    </div>
                </form>
            );
        }

        let IPFSError = '';
        if ( this.state.IPFSError ) {
            IPFSError = <div>UPS! could not upload image to IPFS</div>
        }

        let imageLoaded;
        if ( this.state.selectedFile) {
            imageLoaded = <img 
                className={classes.LoadedImage}
                src={this.state.fileSrc} 
                alt=""
            />
        }

        // let creating;
        // if ( this.props.creatingArtwork ) {
        //     creating = <p>Creating new Token, wait until it is successly added to the next block</p>
        // }

        return (
            <Aux>
                { imageLoaded }
                { form }
                {/* { creating } */}
                { IPFSError }
            </Aux>
        );
    };
}

const mapStateToProps = state => {
    return {
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        IPFSInstance: state.IPFS.IPFSInstance,
        loadingIPFS: state.IPFS.loadingIPFS,
        // creatingArtwork: state.addressInfo.creatingArtwork
    };
};

const mapDispatchToProps = dispatch => ({
    onGetIPFS: () => dispatch(actions.getIPFS()),
    onCreateArtwork: (
        name, 
        tag, 
        IPFSPath, 
        initialPrice, 
        participationPercentage, 
        account,
        methods
    ) => dispatch(actions.createArtwork(
        name, 
        tag, 
        IPFSPath, 
        initialPrice, 
        participationPercentage, 
        account,
        methods
    ))
});

export default connect(
    mapStateToProps, mapDispatchToProps
)(CreateToken);