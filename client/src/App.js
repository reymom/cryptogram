import { Route } from 'react-router-dom';

import Explorer from './containers/Explorer/Explorer';

function App() {
    return (
        <div>
            <Route exact path="/" component={ Explorer }/>
        </div>
    );
}

export default App;

// IPFS Hashes registered
// QmY4j2z4Rj8jXa4NuzZU68cbEwYoCgpdAaqWSAZvh7b6Bh