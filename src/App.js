import React, { Component } from 'react';
import _ from 'lodash';

import GoogleMapReact from 'google-map-react';

import logo from './logo.png';
import './App.css';

import VManager from './serv/rtm';
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
    this.interval = setInterval(() => this.refreshVehicleData(), 500);
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
      return <Vehicle key={v.id} lat={v.latitude} lng={v.longitude} label={v.label}
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
        </div>

      </div>
    );
  }
}

export default App;
