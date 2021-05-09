import React from 'react';
import { connect } from 'react-redux';

import classes from './CreateArtwork.module.css';
import * as actions from '../../store/actions';
import { checkValidity } from '../../shared/utility';

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
            gasFee: {
                elementType: 'select',
                elementConfig: { 
                    type: 'select',
                    options: [
                        { value: 'fastest', displayValue: 'Fastest' },
                        { value: 'fast', displayValue: 'Fast' },
                        { value: 'safeLow', displayValue: 'Cheapest' }
                    ]
                },
                value: 'fast',
                valid: true,
                touched: true
            },
        },
        formIsValid: false,
    }

    componentDidMount() { this.props.onGetIPFS(); }

    inputChangedHandler = ( event, inputIdentifier ) => {
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
                this.setState({ fileSrc: [reader.result] })
            }.bind(this);
            this.setState(prevState => ({
                ...prevState,
                selectedFile: event.target.files[0]
            }));
        }
        if (inputIdentifier === 'gasFee') {
            // no event passed, it is option.value in this case
            updatedFormElement.value = event;
        } else {
            updatedFormElement.value = event.target.value;
            updatedFormElement.valid = checkValidity(
                updatedFormElement.value,
                updatedFormElement.validation
            );
            updatedFormElement.touched = true;
        }
        updatedArtworkForm[inputIdentifier] = updatedFormElement;
        let formIsValid = true;
        for ( let inputIdentifier in updatedArtworkForm ) {
            formIsValid = updatedArtworkForm[inputIdentifier].valid && formIsValid;
        }
        this.setState({ artworkForm: updatedArtworkForm, formIsValid: formIsValid });
    }

    createArtworkHandler = async (event) => {
        event.preventDefault();

        const file = await this.props.IPFSInstance.add(this.state.selectedFile);
        if (file.path) {
            
            let gas = 21000; // before 6721975
            let gasPrice = this.props.gasStation.fast.gasPrice; // before 10000000000
            let gasLimit = 865000; // 
            if ( this.props.web3mode === 'custom' ) {
                if ( this.state.artworkForm.gasFee.value === 'fastest' ) {
                    // gas = 6721975;
                    gasPrice = this.props.gasStation.fastest.gasPrice;
                } else if ( this.state.artworkForm.gasFee.value === 'safeLow') {
                    // gas = 6721975;
                    gasPrice = this.props.gasStation.safeLow.gasPrice;
                }
            }

            this.props.onCreateArtwork(
                // ARTWORK DATA
                this.state.artworkForm['name'].value,
                this.state.artworkForm['tag'].value,
                file.path,
                this.state.artworkForm['initialPrice'].value,
                this.state.artworkForm['participationPercentage'].value,
                // CONTRACT
                this.props.contract,
                // FROM
                this.props.activeAddress,
                // WEB3MODE RELATED
                this.props.web3mode === 'custom', // true if custom handling
                this.props.web3,
                this.props.wallet,
                gas, gasPrice, gasLimit
            )
            this.setState({ selectedFile: null, fileSrc: '' });
            this.props.clickSubmitNewArtwork();
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
                    { formElementsArray.map(formElement => {
                        if (formElement.id === 'gasFee') {
                            return (
                                <div className={classes.GasFeeModalOptions} key={formElement.id}>
                                    { formElement.config.elementConfig.options.map(option => (
                                        <div 
                                            key={option.value} 
                                            value={option.value}
                                            className={
                                                [
                                                    classes.GasFeeOption,
                                                    formElement.config.value === option.value ?
                                                    classes.GasFeeOptionActive : ''
                                                ].join(" ")
                                            }
                                            onClick={ () => this.inputChangedHandler( option.value, formElement.id ) }
                                        >
                                            <h1>{ option.displayValue }</h1>
                                            <div className={classes.OptionDetails}>
                                                <p>
                                                    { 
                                                        parseInt(this.props.gasStation[option.value].gasPrice) / 1000000000
                                                    } Gwei
                                                </p>
                                                <p>{ this.props.gasStation[option.value].time } seconds on average</p>
                                            </div>   
                                        </div>
                                    )) }
                                </div>
                            );
                        }
                        return (
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
                        );
                    }) }
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
        /* -----------------
          FIREBASE PROFILE
        ----------------- */
        gasStation: state.firebaseProfile.gasStation,

        /* -------------
          WEB3 OBJECTS
        ------------- */
        web3mode: state.web3Objects.web3mode,
        // WEB3
        web3: state.web3Objects.web3,
        loadingWeb3: state.web3Objects.loadingWeb3,
        errorWeb3: state.web3Objects.errorWeb3,
        // CONTRACT
        contract: state.web3Objects.contract,
        loadingContract: state.web3Objects.loadingContract,
        errorContract: state.web3Objects.errorContract,
        // WALLET
        wallet: state.web3Objects.wallet,

        /* -------------
          WEB3 ADDRESS
        ------------- */
        activeAddress: state.web3Address.addressActive,

        /* ------
          IPFS
        ------- */
        IPFSInstance: state.IPFS.IPFSInstance,
        loadingIPFS: state.IPFS.loadingIPFS
    };
};

const mapDispatchToProps = dispatch => ({
    onGetIPFS: () => dispatch(actions.getIPFS()),
    onCreateArtwork: (
        name, tag, IPFSPath, initialPrice, participationPercentage, 
        contract, account,
        web3IsManual, web3, gas, gasPrice, gasLimit, wallet
    ) => dispatch(actions.createArtwork(
            name, tag, IPFSPath, initialPrice, participationPercentage, 
            contract, account,
            web3IsManual, web3, gas, gasPrice, gasLimit, wallet
        )
    )
});

export default connect( mapStateToProps, mapDispatchToProps )(CreateToken);