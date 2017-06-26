import React from 'react';

export default props => {
    return <div className="App-vehicle" onClick={props.onClick}>
        {props.label}
    </div>;
};
