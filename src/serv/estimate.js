
export default function estimate_position(prev, last) {
    if(!prev.timestamp || !prev.latitude || !prev.longitude)
        return last;
    var timediff = last.timestamp - prev.timestamp;
    if(!timediff)
        return last;
    var latdiff = last.latitude - prev.latitude;
    var lngdiff = last.longitude - prev.longitude;
    var currenttime = (new Date().getTime() / 1000) - last.timestamp;
    var factor = currenttime / timediff;
    return {
        latitude: last.latitude + (latdiff * factor),
        longitude: last.longitude + (lngdiff * factor),
        //timestamp: Math.floor(new Date().getTime() / 1000)
    };
}
