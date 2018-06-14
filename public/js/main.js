window.onload = start;

// initalize search on load
function start() {
    document.querySelector("#searchBtn").addEventListener("click", () => initSearch());
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

let totalPpl = 0;
let shelterCount = 0;
let shelters = [];
let scroll = false;
let pagination = 0;
let paginationCurr = 0;
function writeShelters(shelter) {
        shelterCount++;
        // shelter coordinates
        const coordinates = shelter.geometry.coordinates;

        // shelter info
        const info = shelter.properties;
        totalPpl += parseInt(info.plasser);
        console.log(totalPpl);

        // card container
        const cardCont = document.createElement("div");
        cardCont.className = "col-4 shelterCard animated fadeIn";
        cardCont.id = "shelter-" + shelterCount;

        // card
        const card = document.createElement("div");
        card.className = "card";

        // shelter location map
        const locationMap = document.createElement("div");
        locationMap.style.width = "100%";
        locationMap.style.height = "300px";
        locationMap.id = "map" + shelterCount;

        // card img mask
        const mask = document.createElement("div");
        mask.className = "masl rgba-white-slight";

        // append card image to card
        //cardOverlay.appendChild(locationMap);
        //cardOverlay.appendChild(mask);
        card.appendChild(locationMap);
        
        // card button
        const btn = document.createElement("a");
        btn.className = "btn-floating btn-action ml-auto mr-4 red accent-3";
        const btnIcon = document.createElement("i");
        btnIcon.className = "fa fa-chevron-right pl-1";
        btn.appendChild(btnIcon);

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
        cardFooter.className = "rounded-bottom  red accent-3 text-center pt-3";

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

        if (!scroll) {
            setTimeout(function(){
                document.querySelector(".loadingScreen").className = "loadingScreen animated fadeOut";
                document.querySelector("#scrollShelters").click();
            }, 3000);

            setTimeout(function(){
                document.querySelector(".loadingScreen").style.display = "none";
                document.querySelector(".loadingScreen").className = "loadingScreen animated fadeIn"

                //document.querySelector("#sheltersRow").style.height = "100vh";
                initPagination();
                animateValue(totalSpots, 0, totalPpl, 1000);
                animateValue(totalShelters, 0, shelterCount, 1000);
            }, 3500);
            scroll = true;
        }

        function initPagination() {
            const amount = Math.round(shelterCount / 10) + 1;
            for (let i = 0; i < amount; i++) {
                const paginationItem = document.createElement("li");
                if (i === 0) {
                    paginationItem.className = "page-item active pr-1 pl-1";

                }

                else {
                    paginationItem.className = "page-item pr-1 pl-1";

                }

                const paginationLink = document.createElement("a");
                paginationLink.className = "page-link";
                paginationLink.innerHTML = i + 1;
                paginationLink.addEventListener("click", paginateNavigate);

                paginationItem.appendChild(paginationLink);

                document.querySelector(".pagination").insertBefore(paginationItem, document.querySelector(".next"));
            }
        }
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
    search.addEventListener("input", () => checkSearch(search.value, runSearch));

    // init canceling of search
    cancelSearch(searchCont);
}

// check search value
function checkSearch(value, run) {

    // add event if matching
    if (value.length > 1) {
        run.style.opacity = "1";
        run.addEventListener("click", search);
        searchValue = value;
    }

    // else remove event
    else {
        run.style.opacity = "0.5";
        run.removeEventListener("click", search);
    }
}

/******** SEARCH *********/
let searchValue;
function search() {
    document.querySelector(".loadingScreen").style.display = "block";
    console.log(searchValue);

    // reset values
    totalPpl = 0;
    shelterCount = 0;
    scroll = false;

    const shelterRow = document.querySelector("#sheltersRow");
    shelterRow.querySelectorAll("div").forEach(div => div.remove());

    // create and display card for each shelter match the search
    shelters.features.forEach(shelter => {
        const info = shelter.properties;

        // make search lower case
        searchValue = searchValue.toLowerCase();

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
    });
}

function cancelSearch(cont) {
    document.querySelector("#cancelSearch").addEventListener("click", () => cont.style.display = "none");
}

let lastPaginate;
function paginateNavigate() {
    document.querySelectorAll(".active").forEach(ele => ele.className = "page-item pr-1 pl-1");
    this.parentElement.className = "page-item active pr-1 pl-1";
    const index = parseInt(this.innerHTML);

    const cards = document.querySelectorAll(".shelterCard");

    let fromRange;
    let toRange;
    console.log(index);
    if (index === 1) {
        fromRange = index - 1;
        toRange = index * 10;
    }

    else {
        fromRange = (index * 10) - 10;
        toRange = fromRange + 11;
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
    console.log(index);
}