import React from 'react';
import { connect } from 'react-redux';

import classes from './Settings.module.css';
import * as actions from '../../store/actions';

import Button from '../../components/UI/Button/Button';
import Modal from '../../components/UI/Modal/Modal';
import CreateAccount from './CreateAccount/CreateAccount';

class Settings extends React.Component {
    state = { activeSidebarOption: 'accounts', creatingAccount: false }

    sidebarOptionClickedHandler = ( sidebarOption ) => {
        this.setState({ activeSidebarOption: sidebarOption })
    }

    showAccountModal = ( web3mode ) => {
        switch ( web3mode ) {
            case ('seed'):
                this.setState({ creatingAccount: true });
                break;
            // case ('browser'):
            //     this.props.onGetBrowserWeb3();
            //     break;
            default:
                console.log('default mode');
        }
    }

    hideAccountModal = () => this.setState({ creatingAccount: false })

    render() {
        let createAccountModal;
        if ( this.state.creatingAccount ) {
            createAccountModal = <Modal 
                show={ this.state.creatingAccount }
                modalClosed={ this.hideAccountModal }>
                    <CreateAccount 
                        clickCancel={this.hideAccountModal}
                        clickSubmit={this.clickSubmitAccountHandler}
                    />
            </Modal>
        }

        let settingsContent;
        switch ( this.state.activeSidebarOption ) {
            case ('accounts'):
                settingsContent =
                    <div className={classes.SettingsContentContainer}>
                        <div className={classes.SettingsContentHeader}>
                            Configure your web3 account
                        </div>
                        <div className={classes.SettingsContent}>
                            <h2>1. Create or import a customized account</h2>
                            <Button btnType="CreateArtwork" clicked={
                                () => { this.showAccountModal('seed') }
                            }>
                                Get Account manually
                            </Button>
                            { createAccountModal }
                            <h2>2. Import from browser (modern browsers, Metamask, ...)</h2>
                            <Button btnType="Follow" clicked={
                                () => { this.showAccountModal('browser') }
                            }>
                                Import from browser
                            </Button>
                        </div>
                    </div>
                break;
            default:
                settingsContent = <div>In construction</div>
        }

        return (
            <div className={classes.SettingsContainer}>
                <div className={classes.SidebarContainer}>
                    <h1>Settings</h1>
                    <div className={classes.SidebarContent}>
                        <li 
                            onClick={
                                () => {this.sidebarOptionClickedHandler('general')}
                            }
                            className={
                                this.state.activeSidebarOption==='general' ? classes.SidebarActiveLi : ''
                            }
                        >
                                General
                        </li>
                        <li 
                            onClick={
                                () => {this.sidebarOptionClickedHandler('accounts')}
                            }
                            className={
                                this.state.activeSidebarOption==='accounts' ? classes.SidebarActiveLi : ''
                            }
                        >
                            Ethereum accounts
                        </li>
                    </div>
                </div>
                { settingsContent }
            </div>
        );
    }
}

// const mapStateToProps = state => {
//     return { }
// }

// const mapDispatchToProps = dispatch => ({ })

export default connect( null, null )(Settings);