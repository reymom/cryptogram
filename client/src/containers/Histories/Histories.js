import React from 'react';

import classes from './Histories.module.css';

class Histories extends React.Component {
    state = { mintEvents: [] };

    componentDidMount () {
        this.props.contract.getPastEvents(
            'AllEvents', { fromBlock: 1 }, (err, events) => {
                this.savePastEventsInfo(events);
            }
        );
    };

    savePastEventsInfo = (events) => {
        for (var i = 0; i<events.length; i++) {
            let event = events[i];
            if (event.event === 'newArtwork') {
                this.setState(prevState => ({ 
                    ...prevState,
                    mintEvents: [...prevState.mintEvents, {
                        creator: event.returnValues.creator,
                        description: event.returnValues.description,
                        tag: event.returnValues.tag,
                        IPFShash: event.returnValues.IPFShash,
                        initialPrice: this.props.web3.utils.fromWei(event.returnValues.initialPrice),
                        participationPercentage: event.returnValues.participationPercentage
                    }]
                }));
            }
        }
    }

    render() {
        let mintEventsRendered;
        if (this.state.mintEvents.length > 0) {
            mintEventsRendered = this.state.mintEvents.map(mintal => {
                let src = 'https://ipfs.io/ipfs/' + mintal.IPFShash;
                return (
                    <li key={mintal.IPFShash} className={classes.Outer}>
                        <div className={classes.Outer}>
                            <img src={src} alt={mintal.description}/> 
                        </div>
                    </li>
                )
            });
        }
        return (
            <div className={classes.Wrapper}>
                <ul>
                    { mintEventsRendered }
                </ul>
            </div>
        );
    };
}

export default Histories;