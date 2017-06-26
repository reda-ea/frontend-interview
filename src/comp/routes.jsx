import React from 'react';
import _ from 'lodash';

export default props => {
    return <div className="App-routes">
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Route</th>
                    <th>Vehicles</th>
                </tr>
            </thead>
            <tbody>
                {_.map(props.routes, (count, route) => {
                    return <tr key={route}>
                        <td>
                            <input type="checkbox"
                                checked={_.includes(props.selected, route)}
                                onChange={e => {
                                    if(!props.onChange)
                                        return;
                                    props.onChange({
                                        route: route,
                                        status: e.target.checked
                                    });
                                }}/>
                        </td>
                        <td>{route}</td>
                        <td>{count}</td>
                    </tr>;
                })}
            </tbody>
        </table>
    </div>;
};
