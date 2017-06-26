import _ from "lodash";

var RTM = require("satori-sdk-js");

var endpoint = "wss://open-data.api.satori.com";
var appKey = "bcB50eFdC575B3DB25ECBddfcBd913e7";
var channel = "transportation";

export default class {
    constructor() {
        this.vehicles = {};
        this.lastMessage = {};
        this._rtm = new RTM(endpoint, appKey);
        // rtm.on("enter-connected", function() {
        //     console.log("Connected to RTM!");
        // });
        var subscription = this._rtm.subscribe(channel, RTM.SubscriptionMode.SIMPLE, {
            filter: "select * from transportation where header.`user-data`='denver'"
        });
        subscription.on('rtm/subscription/data', pdu => {
            pdu.body.messages.forEach(msg => this.processMessage(msg));
        });
    }

    start() {
        this._rtm.start();
    }

    stop() {
        this._rtm.stop();
    }

    processMessage(msg) {
        this.lastMessage = msg;
        msg.entity.forEach(entity => {
            var vehicleData = _.assign({}, this.vehicles[entity.vehicle.vehicle.id]);
            vehicleData.id = entity.vehicle.vehicle.id;
            vehicleData.label = entity.vehicle.vehicle.label;
            if (entity.vehicle.position) {
                vehicleData.latitude = entity.vehicle.position.latitude;
                vehicleData.longitude = entity.vehicle.position.longitude;
            }
            if (entity.vehicle.trip)
                vehicleData.route = entity.vehicle.trip.route_id;
            this.vehicles[entity.vehicle.vehicle.id] = vehicleData;
        });
    }

    getVehiclesWithin(bounds) {
        if(!bounds.lat || !bounds.lng)
            return [];
        return _.filter(this.vehicles, v =>
            v.latitude > bounds.lat[0] &&
            v.latitude < bounds.lat[1] &&
            v.longitude > bounds.lng[0] &&
            v.longitude < bounds.lng[1]
        );
    }

    getLastMessage() {
        return this.lastMessage;
    }

    getRoutes() {
        return _.reduce(this.vehicles, (s, v) => {
            if(!v.route)
                return s;
            if(!s[v.route])
                s[v.route] = 0;
            s[v.route] += 1;
            return s;
        }, {});
    }
}
