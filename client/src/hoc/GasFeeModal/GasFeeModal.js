import React from 'react';
import { connect } from 'react-redux';

import classes from './GasFeeModal.module.css';

import Button from '../../components/UI/Button/Button';
import Modal from '../../components/UI/Modal/Modal';

class GasFeeModal extends React.Component {
    state = { 
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
        }
    }

    inputChangedHandler = ( value ) => {
        this.setState({  
            gasFee: { ...this.state.gasFee, value: value } 
        });
    }

    render() {
        return (
            <React.Fragment>
                <Modal show={this.props.showGasFeeModal} modalClosed={this.props.cancelClicked}>
                    <h1 style={ {textAlign:"center"} }>Transaction cost</h1>
                    <h2 style={ {textAlign:"center"} }>Select the gas cost to pay as a fee</h2>
                    <div>
                        <div className={classes.GasFeeModalOptions}>
                            { this.state.gasFee.elementConfig.options.map(option => (
                                <div 
                                    key={option.value} 
                                    value={option.value}
                                    className={
                                        [
                                            classes.GasFeeOption,
                                            this.state.gasFee.value === option.value ?
                                            classes.GasFeeOptionActive : ''
                                        ].join(" ")
                                    }
                                    onClick={ () => this.inputChangedHandler( option.value ) }
                                >
                                    <h1>{ option.displayValue }</h1>
                                    <div className={classes.OptionDetails}>
                                        <p>
                                            {
                                                parseInt(
                                                    this.props.ethereumInfo.gasStation[option.value].gasPrice
                                                ) / 1000000000 
                                            } Gwei
                                        </p>
                                        <p>
                                            { this.props.ethereumInfo.gasStation[option.value].time } seconds on average
                                        </p>
                                    </div>   
                                </div>
                            )) }
                        </div>

                        <div style={ {textAlign:"center"} }>
                            <Button 
                                btnType="Success"
                                clicked={ () => this.props.submitClicked(this.state.gasFee.value) }
                            >
                                ACCEPT
                            </Button>
                            <Button 
                                type="button" 
                                btnType="Danger" 
                                clicked={ this.props.cancelClicked }>
                                    CANCEL
                            </Button>
                        </div>
                    </div>
                </Modal>
            </React.Fragment>
        )
    };
};

const mapStateToProps = ( state ) => ({
    ethereumInfo: state.firebaseProfile.ethereumInfo,
});

export default connect(mapStateToProps, null)(GasFeeModal);
