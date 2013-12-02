var root_url = "http://metroviz.herokuapp.com/";

function fetchAndProcessRawData(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.onload = cb(xhr);
    xhr.send();
}

function fetchAndProcessData(url, cb) {
    fetchAndProcessRawData(url, makeRawOnloadCb(cb));
}

function makeRawOnloadCb(cb) {
    return function(xhr) {
        return function() {
            var json = JSON.parse(xhr.responseText);
            cb(json);
        }
    }
}

function processRoutes(cb) {
    var url = root_url + "getRoutes";
    fetchAndProcessData(url, cb);
}

function processStops(cb) {
    var url = root_url + "getStops";
    fetchAndProcessData(url, cb);
}

function processAdherence(route, stop, cb) {
    var url = root_url + "getAdherence?route=" + route + "&stop=" + stop;
    fetchAndProcessData(url, cb);
}

function processRidership(route, stop, cb) {
    var url = root_url + "getRidership?route=" + route + "&stop=" + stop;
    fetchAndProcessData(url, cb);
}

function processAdherenceRidership(route, stop, cb) {
    var url = root_url + "getAdherenceRidership?route=" + route + "&stop=" + stop;
    fetchAndProcessData(url, cb);
}

function convertToCalViewFmt(json) {
    var arr,
        year,
        month,
        day, 
        rval = [];
    for (var arr_num in json.data) {
        arr = json.data[arr_num];
        for (var idx = 0; idx < arr.length; idx++) {
            year = +arr[idx].date.slice(0, 4);
            month = +arr[idx].date.slice(4, 6);
            day = +arr[idx].date.slice(6, 8);
            rval.push({
                "route": 1,
                "stop": 1,
                "trip": arr[idx]["ScheduledTime"],
                "delta": arr[idx]["adherence"],
                "boarded": arr[idx]["boarded"],
                "date": new Date(year, month, day),
            });
        }
    }
    return rval;
}

function foo(json) {
    console.log("WO");
    var calViewFmt = convertToCalViewFmt(json);
    console.log(calViewFmt);
}

