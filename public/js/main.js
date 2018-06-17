window.onload = start;

// initalize search on load
function start() {
    document.querySelector("#searchBtn").addEventListener("click", () => initSearch());
    document.querySelector("#nearestLocation").addEventListener("click", () => getUserLocation());
    document.querySelector("#seeAll").addEventListener("click", () => seeAll());
    document.querySelector("#sendShelterBtn").addEventListener("click", () => $('#modalSendShelter').modal('show'));
    document.querySelector("#toForm").addEventListener("click", () => document.querySelector("#sendShelterBtn").click());
}

// get data from JSON file
function getShelters(dataset) {
    const getJSON = new XMLHttpRequest();
    getJSON.onreadystatechange = function() {
        if (getJSON.readyState == 4 && getJSON.status == 200) {
            shelters = JSON.parse(getJSON.responseText);
        }
    }
    getJSON.open("GET", dataset, true); 
    getJSON.send(null);
}

function initMap() {
    const dataset = getShelters("/dataset");
}

// globals
let totalPpl = 0;
let shelterCount = 0;
let shelters = [];
let sheltersData = [];
let scroll = false;
let pagination = 0;
let paginationCurr = 0;
let isClosest;

// write a shelter card
function writeShelters(shelter, closest) {

        // check for mode
        if (closest) {
            isClosest = closest;
        }

        shelterCount++;
        // shelter coordinates
        const coordinates = shelter.geometry.coordinates;

        // shelter info
        const info = shelter.properties;
        sheltersData.push({id: shelterCount, data: info});
        totalPpl += parseInt(info.plasser);
        console.log(totalPpl);

        // card container
        const cardCont = document.createElement("div");
        cardCont.className = "col-sm-12 col-md-6 col-lg-4 shelterCard animated fadeIn";
        cardCont.id = "shelter-" + shelterCount;
        cardCont.value = coordinates[1] + "-" + coordinates[0];

        // card
        const card = document.createElement("div");
        card.className = "card";

        // shelter location map
        const locationMap = document.createElement("div");
        locationMap.style.width = "100%";
        locationMap.style.height = "300px";
        locationMap.id = "map" + shelterCount;

        const mask = document.createElement("div");
        mask.className = "masl rgba-white-slight";
        card.appendChild(locationMap);
        
        // card button
        const btn = document.createElement("a");
        btn.className = "btn-floating btn-action ml-auto mr-4 pink accent-3";
        const btnIcon = document.createElement("i");
        btnIcon.className = "fa fa-chevron-right pl-1";
        btn.appendChild(btnIcon);
        btn.addEventListener("click", () => expandCard(cardCont))

        // append button to card
        card.appendChild(btn);

        // card content
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        // card title
        const cardTitle = document.createElement("h4");
        cardTitle.className = "card-title";
        cardTitle.innerHTML = info.adresse;
        const line = document.createElement("hr");

        // card intro
        const cardIntro = document.createElement("p");
        cardIntro.className = "card-text";
        cardIntro.innerHTML = info.kommune;

        // append title and intro to body
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(line);
        cardBody.appendChild(cardIntro);

        // append body to card
        card.appendChild(cardBody);

        // card footer
        const cardFooter = document.createElement("div");
        cardFooter.className = "rounded-bottom pink accent-3 text-center pt-3";

        // footer list
        const cardList = document.createElement("ul");
        cardList.className = "list-unstyled list-inline font-small";

        // spots
        const spots = document.createElement("li");
        spots.className = "list-inline-item pr-2 white-text";
        spots.innerHTML = info.plasser + "<span class='spots'> plasser</span>";
        const spotsIcon = document.createElement("i");
        spotsIcon.className = "fa fa-group pr-1";
        spotsIcon.style.float = "left";
        spots.appendChild(spotsIcon);

        // areal
        const areal = document.createElement("li");
        areal.className = "list-inline-item pr-2 white-text";
        if (info.areal == 0) {
            areal.innerHTML = "N/A <span class='kvm'> km2</span>";
        }

        else {
            areal.innerHTML = info.areal + "<span class='kvm'> km2</span>";
        }

        const arealIcon = document.createElement("i");
        arealIcon.className = "fa fa-institution pr-1";
        arealIcon.style.float = "left";
        areal.appendChild(arealIcon);

        // building year
        const year = document.createElement("li");
        year.className = "list-inline-item pr-2 white-text";
        year.innerHTML = info.byggear + "<span class='year'> byggeår</span>";
        const yearIcon = document.createElement("i");
        yearIcon.className = "fa fa-birthday-cake pr-1";
        yearIcon.style.float = "left";
        year.appendChild(yearIcon);

        cardList.appendChild(spots);
        cardList.appendChild(areal);
        cardList.appendChild(year);
        cardFooter.appendChild(cardList);
        card.appendChild(cardFooter);
        cardCont.appendChild(card);

        if (shelterCount > 10) {
            cardCont.style.display = "none";
        }

        document.querySelector("#sheltersRow").appendChild(cardCont);

        // create map 
        createMap(locationMap, coordinates[1], coordinates[0]);

        // display the data for user
        const totalSpots = document.querySelector("#shelterSpots");
        const totalShelters = document.querySelector("#shelterTotal");
        
        // fade out loading
        if (!scroll) {
            loading();
            setTimeout(function(){
                initPagination();
                animateValue(totalSpots, 0, totalPpl, 1000);
                animateValue(totalShelters, 0, shelterCount, 1000);

                if (isClosest) {
                    document.querySelector("#resultFor").innerHTML = "Nærmeste tilfluktsrom fra deg er <br><span class='mt-5 h4-responsive font-weight-bold text-center'>" + info.adresse + "</span>";
                }
                document.querySelector("#shelterInfo").style.display = "flex";
            }, 3500);
            scroll = true;
        }

        // create pagination
        function initPagination() {
            if (shelterCount > 9) {
                const amount = Math.round(shelterCount / 10) + 1;
                for (let i = 0; i < amount; i++) {
                    const paginationItem = document.createElement("li");
                    if (i === 0) {
                        paginationItem.className = "page-item active pr-1 pl-1 paginationItem";

                    }

                    else {
                        paginationItem.className = "page-item pr-1 pl-1 paginationItem";

                    }

                    const paginationLink = document.createElement("a");
                    paginationLink.className = "page-link paginationLink";
                    paginationLink.innerHTML = i + 1;
                    paginationLink.addEventListener("click", paginateNavigate);

                    paginationItem.appendChild(paginationLink);

                    document.querySelector(".pagination").appendChild(paginationItem);
                    if (paginationLink.innerHTML == 1) {
                        paginationLink.click();
                    }
                }
            }
        }
}

// loading screen
function loading(noFound) {
    setTimeout(function(){
        document.querySelector(".loadingScreen").className = "loadingScreen animated fadeOut";
        document.querySelector("#scrollShelters").click();
    }, 3000);

    setTimeout(function(){
        document.querySelector(".loadingScreen").style.display = "none";
        document.querySelector(".loadingScreen").className = "loadingScreen animated fadeIn";

        if (!isClosest) {
            document.querySelector("#resultFor").innerHTML = "Resultat for <span class='mt-5 h4-responsive font-weight-bold text-center'>" + document.querySelector("#search").value.toUpperCase();
        }

        if (noFound) {
            document.querySelector("#noResults").style.display = "block";
        }

        else {
            document.querySelector("#noResults").style.display = "none";
        }
    }, 3500);
}

function animateValue(ele, start, end, duration) {
    // assumes integer values for start and end

    const range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    const minTimer = 50;
    // calc step time to show all interediate values
    let stepTime = Math.abs(Math.floor(duration / range));

    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);

    // get current time and calculate desired end time
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    function run() {
        var now = new Date().getTime();
        var remaining = Math.max((endTime - now) / duration, 0);
        var value = Math.round(end - (remaining * range));
        ele.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }

    var timer = setInterval(run, stepTime);
    run();
}

// create map for shelter card
function createMap(ele, lat, lng) {
    // map options
    const mapProp = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 14,
    };

    // initialize new map
    const map = new google.maps.Map(ele, mapProp);

    // map marker
    const marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
    });
}

// initalize search and display
function initSearch() {
    // search container
    const searchCont = document.querySelector("#searchCont");
    searchCont.style.display = "block";

    // search run button
    const runSearch = document.querySelector("#runSearch");

    // search input
    const search = document.querySelector("#search");

    // focus search and run function on input
    search.focus();
    search.addEventListener("keyup", () => checkSearch(search.value, runSearch));

    // init canceling of search
    cancelSearch(searchCont);
}

// check search value
function checkSearch(value, run) {
    // add event if matching
    if (value.length > 1) {
        run.style.opacity = "1";

        // run event
        run.addEventListener("click", search);

        // enables enter key
        if (this.event.keyCode === 13) {
            run.click();
        }

        searchValue = value;
    }

    // else remove event
    else {
        run.style.opacity = "0.5";
        run.removeEventListener("click", search);
    }
}

function resetValues() {
    document.querySelectorAll(".paginationItem").forEach(ele => ele.remove());
    document.querySelector(".loadingScreen").style.display = "block";
    document.querySelector("#shelterInfo").style.display = "none";
    totalPpl = 0;
    shelterCount = 0;
    scroll = false;
    isClosest = false;
    sheltersData = [];

    const shelterRow = document.querySelector("#sheltersRow");
    shelterRow.querySelectorAll("div").forEach(div => div.remove());
}

/******** SEARCH *********/
let searchValue;
function search() {

    // clear and resets values
    resetValues();

    // make search lower case
    searchValue = searchValue.toLowerCase();

    // create and display card for each shelter match the search
    let count = 0;
    shelters.features.forEach(shelter => {
        const info = shelter.properties;

        // check for address
        if (info.adresse.toLowerCase() === searchValue) {
            writeShelters(shelter);
        }
        
        // check for municipality
        else if (info.kommune.toLowerCase() === searchValue) {
            writeShelters(shelter);
        }

        // check for districtname
        else if (info.distriktsnavn.toLowerCase().includes(searchValue)  || info.distriktsnavn.toLowerCase() === searchValue) {
            writeShelters(shelter);
        }

        else {
            // stop loading if no results are found
            count++;
            if (count === shelters.features.length) {
                loading(true);
            }
        }
    });
}

function cancelSearch(cont) {
    document.querySelector("#cancelSearch").addEventListener("click", () => cont.style.display = "none");
}

function paginateNavigate() {
    document.querySelector(".pagination").querySelectorAll(".active").forEach(ele => ele.className = "page-item pr-1 pl-1 paginationItem");
    this.parentElement.className = "page-item active pr-1 pl-1 paginationItem";
    const index = parseInt(this.innerHTML);

    const cards = document.querySelectorAll(".shelterCard");

    let fromRange;
    let toRange;
    if (index === 1) {
        fromRange = index - 1;
        toRange = (index * 10);
    }

    else {
        fromRange = (index * 10) - 11;
        toRange = fromRange + 10;
    }

    cards.forEach(card => {
        // hide card
        card.style.display = "none";

        // display if within index range
        const cardId = parseInt(card.id.split("-")[1]);
        if (cardId > fromRange && cardId < toRange) {
            card.style.display = "block";
        }
    });
}

function getUserLocation() {
    if (navigator.geolocation) {
        resetValues();
        const location = navigator.geolocation.getCurrentPosition(showLocation);
    }

    else {
        console.log("qweqweqwe");
    }
}

function showLocation(position) {
    const lat = position.coords.latitude; 
    const lng = position.coords.longitude;

    let mindif = 99999;
    let closestShelter;
    shelters.features.forEach(shelter => {
        let shelterCoords = shelter.geometry.coordinates;
        const dif = PythagorasEquirectangular(lat, lng, shelterCoords[1], shelterCoords[0]);
        if (dif < mindif) {
            closestShelter = shelter;
            mindif = dif;
            console.log(closestShelter);
        }
    });

    writeShelters(closestShelter, true);


    // Convert Degress to Radians
    function Deg2Rad(deg) {
        return deg * Math.PI / 180;
    }
  
    function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
        lat1 = Deg2Rad(lat1);
        lat2 = Deg2Rad(lat2);
        lon1 = Deg2Rad(lon1);
        lon2 = Deg2Rad(lon2);
        const R = 6371; // km
        const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
        const y = (lat2 - lat1);
        const d = Math.sqrt(x * x + y * y) * R;
        return d;
    }
}

function seeAll() {
    resetValues();
    shelters.features.forEach(shelter => {
        writeShelters(shelter);
    });
}

function expandCard(card) {

    const mapEle = document.querySelector("#modalMap");
    const lat = parseFloat(card.value.split("-")[0]);
    const lng = parseFloat(card.value.split("-")[1])

    const shelterID = parseInt(card.id.split("-")[1]) - 1;
    const shelterData = sheltersData[shelterID].data;

    // assign data to modal elements
    document.querySelector("#modalAdresse").innerHTML = shelterData.adresse;
    document.querySelector("#modalAreal").innerHTML = shelterData.areal + " km2";
    document.querySelector("#modalKommunenr").innerHTML = shelterData.kommunenr;
    document.querySelector("#modalGnrBnr").innerHTML = "gnr. " + shelterData.gnr + ", bnr. " + shelterData.bnr;
    document.querySelector("#modalKommune").innerHTML = shelterData.kommune;
    document.querySelector("#modalDistriktsnavn").innerHTML = shelterData.distriktsnavn;
    document.querySelector("#modalKategori").innerHTML = shelterData.kategori;
    document.querySelector("#modalPlasser").innerHTML = shelterData.plasser;
    document.querySelector("#modalRomstype").innerHTML = shelterData.romtype;

    // hide body scrollbar
    document.body.style.overflow = "hidden";

    // init close modal event
    document.querySelector("#closeModal").addEventListener("click", () => document.body.style.overflow = "auto");

    createMap(mapEle, lat, lng);
    $('#expandCard').modal('show');
}