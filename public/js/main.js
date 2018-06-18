window.onload = start;

// initalize search on load
let isIE;
function start() {

    // run animations on page if not mobile
    if (!checkIfMobile()) {
        //wow animation init
        new WOW().init();
    }

    // get rect of page
    getRect(document.querySelector(".view"));

    // check browser
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
        isIE = true;
        document.querySelector("#nearestLocation").style.opacity = "0.3";
        document.querySelector("#nearestLocation").classList.remove("introBtn");
        document.querySelector("#nearestLocation").addEventListener("click", () => toastr["info"]("Denne funksjoner er ikke tilgjenlig hos nettleserene <strong>Internet Explorer</strong> eller <strong>Microsoft Edge</strong>"));
    }

    else {
        document.querySelector("#nearestLocation").addEventListener("click", () => getUserLocation());
    }

    // EVENTS
    document.querySelector("#searchBtn").addEventListener("click", () => initSearch());
    document.querySelector("#seeAll").addEventListener("click", () => seeAll());
    document.querySelector("#sendShelterBtn").addEventListener("click", () => $('#modalSendShelter').modal('show'));
    document.querySelector("#toForm").addEventListener("click", () => document.querySelector("#sendShelterBtn").click());
}

// check if device is mobile
function checkIfMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    }
}

// get top rect of page
function getRect(ele) {
    let rect;
    window.addEventListener("scroll", () => {
        rect = ele.getBoundingClientRect();
        let curPos = (Math.abs(rect.top) / 1000) + 0.05;
        let mask = document.querySelector(".rgba-black-strong");
        if (curPos >= 0.675) {
            mask.style.backgroundColor = "rgba(0,0,0," + curPos + ")";
        }

        else {
            mask.style.backgroundColor = "rgba(0,0,0, 0.7)";
        }

        console.log(curPos);
    });
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

// GLOBALS
let totalPpl = 0;
let shelterCount = 0;
let shelters = [];
let sheltersData = [];
let scroll = false;
let pagination = 0;
let paginationCurr = 0;
let isClosest;
let seeAllShelters;
let speed = 3500;

// write a shelter card
function writeShelters(shelter, closest, seeAll) {

        // increase cont
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

         // check for mode
         if (closest) {
            isClosest = closest;
            cardCont.className = "col-12 shelterCard animated fadeIn";
        }

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

        // detect IE8 and above, and Edge
        if (isIE) {
            speed = 4000;
        }

        // check network speed
        else {
            if (navigator.connection.downlink > 0.6) {
                speed = 4000; // fast / normal
            }
    
            else {
                speed = 4500; // slow
            }
        }

        if (isClosest) {
            speed = 1500;
        }
        
        // fade out loading
        if (!scroll) {

            if (seeAll) {
                setTimeout(function(){
                    loading();
                }, 1500);
            }

            else {
                loading();
            }
            setTimeout(function(){

                // create pagination
                initPagination();

                // start countup animations
                document.querySelector("#shelterSpots").innerHTML = totalPpl;
                document.querySelector("#shelterTotal").innerHTML = shelterCount;

                if (isClosest) {
                    document.querySelector("#resultFor").innerHTML = "Nærmeste tilfluktsrom fra deg er <br><span class='mt-5 h4-responsive font-weight-bold text-center'>" + info.adresse + "</span>";
                }
                document.querySelector("#shelterInfo").style.display = "flex";
            }, speed);
            scroll = true; // set scroll to true
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
    document.querySelector("#resultFor").style.display = "block";
    setTimeout(function(){
        document.body.style.overflow = "auto"
        document.querySelector("#scrollShelters").click();
        document.querySelector(".loadingScreen").className = "loadingScreen animated fadeOutUp";
        setTimeout(function(){
            document.querySelector(".loadingScreen").style.display = "none";
            document.querySelector(".loadingScreen").className = "loadingScreen animated fadeIn";
        }, 2000);
    }, speed);

    setTimeout(function(){

        if (seeAllShelters) {
            document.querySelector("#resultFor").innerHTML = "Viser alle <span class='mt-5 h4-responsive font-weight-bold text-center'>registrerte</span> tilfluktsrom";
            return;
        }

        if (!isClosest) {
            document.querySelector("#resultFor").innerHTML = "Resultat for <span class='mt-5 h4-responsive font-weight-bold text-center'>" + document.querySelector("#search").value.toUpperCase();
        }

        if (noFound) {
            document.querySelector("#noResults").style.display = "block";
            document.body.style.overflow = "auto"
        }

        else {
            document.querySelector("#noResults").style.display = "none";
        }
    }, speed);
}

// create map for shelter card
function createMap(ele, lat, lng, expand) {
    // map options
    const coords = new google.maps.LatLng(lat, lng);
    const mapProp = {
        center: coords,
        zoom: 14,
    };

    // initialize new map
    const map = new google.maps.Map(ele, mapProp);

    // map marker
    const marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
    });

    if (expand) {
        // streetview query
        const url = "https://maps.googleapis.com/maps/api/streetview?size=1000x1000&location=" + lat + "," + lng + "&heading=90&pitch=-0.76&key=AIzaSyA_jiuMdTONboV9E0sHZ5U5-js9zwyd4GU";
        
        // no img found
        if (httpGet(url) <= 8743) {
            document.querySelector("#modalImg").src = "img/noImage.png";
        }

        // display streetview
        else {
            document.querySelector("#modalImg").src = url;
        }
    }
}

// false for synchronous request / get streetview response
function httpGet(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.response.length;
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

function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// reset all values and start loading screen, run until content & maps are loaded
function resetValues() {
    // set random img
    document.querySelector(".loadingScreen").style.background = "linear-gradient(rgba(20,20,20, .8), rgba(20,20,20, .8)),url('/img/loading/loading" + randomIntFromInterval(1, 3) + ".jpg')";


    document.body.style.overflow = "hidden";
    document.querySelectorAll(".paginationItem").forEach(ele => ele.remove());
    document.querySelector(".loadingScreen").style.display = "block";
    document.querySelector("#shelterInfo").style.display = "none";
    document.querySelector("#resultFor").innerHTML = "";
    document.querySelector("#shelterSpots").innerHTML = "";
    document.querySelector("#shelterTotal").innerHTML = "";
    totalPpl = 0;
    shelterCount = 0;
    scroll = false;
    isClosest = false;
    seeAllShelters = false;
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
    setTimeout(function(){ // timeout for loading screen
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
    }, 250);
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


    // convert degress to radians
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

// see all shelters
function seeAll() {
    resetValues();
    seeAllShelters = true;

    setTimeout(function(){ // timeout for loading screen
        shelters.features.forEach(shelter => {
            writeShelters(shelter, false, true);
        });
    }, 250);
}

// display modal with card data
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
    document.querySelector("#modalDistriktsnavn").innerHTML = shelterData.distriktsnavn.split("SFD")[0];
    document.querySelector("#modalKategori").innerHTML = shelterData.kategori;
    document.querySelector("#modalPlasser").innerHTML = shelterData.plasser;
    document.querySelector("#modalRomstype").innerHTML = shelterData.romtype;
    document.querySelector("#modalImg").setAttribute("alt", "Streetview av " + shelterData.adresse);

    // hide body scrollbar
    document.body.style.overflow = "hidden";

    // init close modal event
    document.querySelector("#closeModal").addEventListener("click", () => document.body.style.overflow = "auto");

    // create map and display
    createMap(mapEle, lat, lng, true);
    $('#expandCard').modal('show');
}