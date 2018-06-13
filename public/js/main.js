window.onload = start;

function start() {
    const dataset = getShelters("/dataset");
}

function getShelters(dataset) {
    const getJSON = new XMLHttpRequest();
    getJSON.onreadystatechange = function() {
        if (getJSON.readyState == 4 && getJSON.status == 200) {
           writeShelters(getJSON.responseText);
        }
    }
    getJSON.open("GET", dataset, true); 
    getJSON.send(null);
}

function writeShelters(shelters) {
    console.log(shelters)
}