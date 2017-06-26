import React, { Component } from 'react';
import _ from 'lodash';

import GoogleMapReact from 'google-map-react';

import logo from './logo.png';
import './App.css';

import VManager from './serv/rtm';
import estimate_position from './serv/estimate';
import Vehicle from './comp/vehicle';
import Routes from './comp/routes';

class App extends Component {
  constructor(props) {
    super(props);
    this.manager = new VManager();
    this.state = {
      lastMessage: {},
      vehicles: [],
      view: {
        center: {lat: 39.729343424776204, lng: -104.9984253967285},
        zoom: 11
      },
      selectedRoutes: []
    };
  }

  componentDidMount() {
    this.manager.start();
    this.interval = setInterval(() => this.refreshVehicleData(), 100);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.manager.stop();
  }

  refreshVehicleData() {
    this.setState({
      lastMessage: this.manager.getLastMessage(),
      vehicles: this.manager.getVehiclesWithin(this.state.view),
      routes: this.manager.getRoutes()
    });
  }

  setView(center, zoom, bounds) {
    this.setState({
      view: {
        center, zoom,
        lat: [bounds.sw.lat, bounds.ne.lat],
        lng: [bounds.sw.lng, bounds.ne.lng]
      }
    });
  }

  updateSelection(e) {
    this.setState({
      selectedRoutes: e.status ? _.union(this.state.selectedRoutes, [e.route]) :
                                 _.difference(this.state.selectedRoutes, [e.route])
    });
  }

  renderVehicles() {
    return this.state.vehicles.filter(v => {
      if(_.isEmpty(this.state.selectedRoutes))
        return true;
      if(!v.route)
        return false;
      return _.includes(this.state.selectedRoutes, v.route);
    }).map(v => {
      var position = _.pick(v, ['latitude', 'longitude'/*, 'timestamp'*/]);
      if(v.prev && this.state.estimate)
        position = estimate_position(v.prev, v);
      return <Vehicle key={v.id} label={v.label}
                      lat={position.latitude} lng={position.longitude}
                      onClick={()=>console.log(v)}/>;
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Frontend Coding Exercise</h2>
        </div>
        <div className="App-container-left">
          <Routes routes={this.state.routes} selected={this.state.selectedRoutes} onChange={e => this.updateSelection(e)}/>
        </div>
        <div className="App-container-right">
          <GoogleMapReact
            center={this.state.view.center}
            zoom={this.state.view.zoom}
            onChange={e => {
              this.setView(e.center, e.zoom, e.bounds);
              this.refreshVehicleData();
            }}
          >
            {this.renderVehicles()}
          </GoogleMapReact>
          <label>
            <input type="checkbox" onChange={e => this.setState({estimate: e.target.checked})}/>
            Estimate Vehicle locations
          </label>
        </div>

      </div>
    );
  }
}

export default App;
