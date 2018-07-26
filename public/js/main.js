/**
 * @author Sander Hellesø
 */

// GLOBALS
let isIE;
let totalPpl = 0;
let shelterCount = 0;
let shelters = [];
let sheltersData = [];
let cards = [];
let scroll = false;
let pagination = 0;
let paginationCurr = 0;
let isClosest;
let seeAllShelters;
let speed = 3500;

// start app on load
window.onload = start;

// initalize app
function start() {

    // initalize form keyup
    formInit();

    // initalize share buttons
    share();

    // check browser
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
        isIE = true;
        document.querySelector("#nearestLocation").style.opacity = "0.3";
        document.querySelector("#nearestLocation").classList.remove("introBtn");
        document.querySelector("#nearestLocation").addEventListener("click", () => toastr["info"]("Denne funksjoner er ikke tilgjenlig hos nettleserene <strong>Internet Explorer</strong> eller <strong>Microsoft Edge</strong>"));
    }

    else {
        // scroll top on page load if not IE
        $('html,body').scrollTop(0);

        document.querySelector("#nearestLocation").addEventListener("click", () => getUserLocation());

        // get rect of page
        getRect(document.querySelector(".view"));
        
        // run animations on page if not mobile
        if (!checkIfMobile()) {

            //wow animation init
            new WOW().init();
        }
    }

    // EVENTS
    document.querySelector("#searchBtn").addEventListener("click", () => initSearch());
    document.querySelector("#seeAll").addEventListener("click", () => $('#infoModal').modal('show'));
    document.querySelector("#openMainMapTrigger").addEventListener("click", openMainMap);
    document.querySelector("#infoModalBtn").addEventListener("click", () => seeAll());
    document.querySelector("#sendInfoShelter").addEventListener("click", () => formCheck());
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

// opens and display every shelter on map
let isCreated = false;
function openMainMap() {
    $('#openMainMap').modal('show');
    document.querySelector("#openMainMap").querySelector("#closeModal").addEventListener("click", () => document.body.style.overflowY = "scroll");
    document.body.style.overflowY = "hidden";

    if (!isCreated) {
        setTimeout(() => {
            fillMainMap(shelters);
            isCreated = true;
        }, 100);
    }
}

function initMap() {
    const dataset = getShelters("/dataset");
}

function fillMainMap(shelters) {
    const coords = new google.maps.LatLng(63.446827, 10.421906);
    const mapProp = {
          center: coords,
          zoom: 6,
    };
  
    // initialize new map
    const map = new google.maps.Map(document.querySelector("#modalMainMap"), mapProp);
  
    // map marker
    shelters.features.forEach((shelter) => {
        const contentString = `
        <h4>${shelter.properties.adresse.toUpperCase()}</h4>
        <ul class="mapList">
            ${Object.keys(shelter.properties).map(key => "<li><strong>" + key.toUpperCase() + "</strong>: " + shelter.properties[key] + "</li>").join(" ")}
        </ul>
        `;

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        const marker = new google.maps.Marker({
            position: {lat: shelter.geometry.coordinates[1], lng: shelter.geometry.coordinates[0]},
            map: map
        });

        marker.addListener('click', () => {
            infowindow.open(document.querySelector("#modalMainMap"), marker);
        });
    });
}

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
            areal.innerHTML = "N/A <span class='kvm'> m2</span>";
        }

        else {
            areal.innerHTML = info.areal + "<span class='kvm'> m2</span>";
        }

        const arealIcon = document.createElement("i");
        arealIcon.className = "fa fa-institution pr-1";
        arealIcon.style.float = "left";
        areal.appendChild(arealIcon);

        // building year
        const year = document.createElement("li");
        year.className = "list-inline-item pr-2 white-text";
        year.innerHTML = "<span class='year'>Byggeår: " + info.byggear + "</span>";
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
        cards.push(cardCont);

        document.querySelector("#sheltersRow").appendChild(cardCont);

        // create map 
        createMap(locationMap, coordinates[1], coordinates[0]);

        // display the data for user
        const totalSpots = document.querySelector("#shelterSpots");
        const totalShelters = document.querySelector("#shelterTotal");
        speed = 4000; // fast / normal

        if (isClosest) {
            speed = 1500;
        }
        
        // fade out loading
        if (!scroll) {

            document.querySelector("#noResults").style.display = "none";
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
                    document.querySelector("#shelterInfo").style.display = "none";
                    document.querySelector("#resultFor").innerHTML = "Nærmeste tilfluktsrom fra deg er <br><span class='mt-5 h4-responsive font-weight-bold text-center'>" + info.adresse + "</span>";
                }

                else {
                    document.querySelector("#shelterInfo").style.display = "flex";
                }

            }, speed);
            scroll = true; // set scroll to true
        }

        // create pagination
        function initPagination() {
            if (shelterCount > 9) {
                const amount = Math.round((shelterCount + 5) / 10);
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
    if (!noFound) {
        // update loading screen message
        document.querySelector("#loadingMsg").innerHTML = "Henter kartdata...";
    }

    else {
        document.querySelector("#loadingMsg").innerHTML = "Søker etter treff...";
    }

    document.querySelector("#resultFor").style.display = "block";
    setTimeout(function(){
        document.body.style.overflow = "auto"
        document.querySelector("#scrollShelters").click();
        document.querySelector(".loadingScreen").className = "loadingScreen animated fadeOutUp";

        // remove url-hash
        removeHash();
        setTimeout(function(){
            document.querySelector(".loadingScreen").style.display = "none";
            document.querySelector(".loadingScreen").className = "loadingScreen animated fadeIn";

            // enable buttons again
            document.querySelectorAll(".introBtn").forEach(btn => btn.classList.remove("disabled"));
        }, 2000);
    }, speed);

    setTimeout(function(){

        if (seeAllShelters) {
            document.querySelector("#resultFor").innerHTML = "Viser alle <span class='mt-5 h4-responsive font-weight-bold text-center'>registrerte</span> tilfluktsrom";
            return;
        }

        if (!isClosest) {
            document.querySelector("#resultFor").innerHTML = "Søketreff for <span class='mt-5 h4-responsive font-weight-bold text-center'>" + searchWord.toUpperCase();
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

    $(window).resize(function() {
        google.maps.event.trigger(map, 'resize');
    });

    if (expand) {
        // streetview query
        const url = "https://maps.googleapis.com/maps/api/streetview?size=1000x1000&location=" + lat + "," + lng + "&heading=90&pitch=-0.76&key=AIzaSyA_jiuMdTONboV9E0sHZ5U5-js9zwyd4GU";
        
        // no img found
        if (httpGet(url) <= 20000) {
            document.querySelector("#modalImg").src = "img/noImage.png";
        }

        // display streetview
        else {
            document.querySelector("#modalImg").src = url;
        }
        document.querySelector("#expandCard").querySelector(".modal-body").style.filter = "blur(0px)";
    }
}


// reset all values and start loading screen, run until content & maps are loaded
function resetValues() {

    // disable buttons to avoid spam clicking
    document.body.style.overflow = "hidden";
    document.querySelector("#runSearch").removeEventListener("click", search);
    document.querySelectorAll(".introBtn").forEach(btn => btn.classList.add("disabled"));
    document.querySelectorAll(".paginationItem").forEach(ele => ele.remove());
    document.querySelector(".loadingScreen").style.display = "block";
    document.querySelector("#shelterInfo").style.display = "none";
    document.querySelector("#resultFor").innerHTML = "";
    document.querySelector("#shelterSpots").innerHTML = "";
    document.querySelector("#shelterTotal").innerHTML = "";
    document.querySelector("#search").value = "";
    document.querySelector("#loadingMsg").innerHTML = "";

    totalPpl = 0;
    shelterCount = 0;
    searchCount = 0;
    scroll = false;
    isClosest = false;
    seeAllShelters = false;
    sheltersData = [];
    cards = [];

    const shelterRow = document.querySelector("#sheltersRow");
    shelterRow.querySelectorAll("div").forEach(div => div.remove());
}


// false for synchronous request / get streetview response
function httpGet(url) {
    const xmlHttp = new XMLHttpRequest();
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

    // enables enter key if not mobile
    if (!checkIfMobile()) {
        $("#search").keypress(function(e) {
            if (e.keyCode === 13 && search.value.length > 1) {
                runSearch.click();
            }
        });
    }

    // init canceling of search
    cancelSearch(searchCont);
}

// check search value
function checkSearch(value, run) {
    // add event if matching
    document.querySelector("#loadingMsg").innerHTML = "Søker etter treff...";
    if (value.length > 1) {
        searchCount = 1;
        if (searchCount === 1) {
            run.style.opacity = "1";

            // run event
            run.addEventListener("click", search);
        }
    }

    else {
        searchCount = 0;
        run.style.opacity = "0.5";
        run.removeEventListener("click", search);
    }
}

/******** SEARCH *********/
let searchWord;
let searchCount = 0;
function search() {
    document.querySelector(".loadingScreen").style.display = "block";
    document.querySelector("#loadingMsg").innerHTML = "Søker etter treff...";

    // make search lower case
    let searchValue;
    searchValue = document.querySelector("#search").value.toLowerCase();
    searchWord = searchValue;
    resetValues();

    // create and display card for each shelter match the search
    let count = 0;
    setTimeout(function(){ // timeout for loading screen
        // clear and resets values

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

// cancel and remove searchbar
function cancelSearch(cont) {
    document.querySelector("#cancelSearch").addEventListener("click", () => cont.style.display = "none");
}

// initalize pagination
function paginateNavigate() {
    document.querySelector(".pagination").querySelectorAll(".active").forEach(ele => ele.className = "page-item pr-1 pl-1 paginationItem");
    this.parentElement.className = "page-item active pr-1 pl-1 paginationItem";
    const index = parseInt(this.innerHTML);

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

    const cardsCont = document.querySelector("#shelters").querySelectorAll(".shelterCard");
    cardsCont.forEach(card => {
        card.remove();
    });

    cards.forEach(card => {
        const cardId = parseInt(card.id.split("-")[1]);
        // display if within index range
        if (cardId > fromRange && cardId < toRange) {
            document.querySelector("#sheltersRow").appendChild(cards[cardId - 1]);
        }
    });
}

// promt user for location
function getUserLocation() {
    if (navigator.geolocation) {
        resetValues();
        const location = navigator.geolocation.getCurrentPosition(showLocation);
    }

    else {
        toastr["error"]("Klarer ikke hente brukers posisjon!");
    }
}

// get user location and closest shelter
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
        }
    });

    // create shelter
    writeShelters(closestShelter, true);

    // convert degress to radians
    function Deg2Rad(deg) {
        return deg * Math.PI / 180;
    }
    
    // calculate data
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
    document.querySelector("#cancelInfoModal").click();
    document.querySelector(".loadingScreen").style.display = "block";
    resetValues();
    document.querySelector("#loadingMsg").innerHTML = "Henter tilfluktsrom...";
    seeAllShelters = true;

    setTimeout(function(){ // timeout for loading screen
        shelters.features.forEach(shelter => {
            writeShelters(shelter, false, true);
        });
    }, 250);
}

// display modal with card data
function expandCard(card) {

    document.body.style.overflowY = "hidden";
    const mapEle = document.querySelector("#modalMap");
    const lat = parseFloat(card.value.split("-")[0]);
    const lng = parseFloat(card.value.split("-")[1])

    const shelterID = parseInt(card.id.split("-")[1]) - 1;
    const shelterData = sheltersData[shelterID].data;

    // assign data to modal elements
    document.querySelector("#modalAdresse").innerHTML = shelterData.adresse;
    document.querySelector("#modalAreal").innerHTML = shelterData.areal + " m2";
    document.querySelector("#modalKommunenr").innerHTML = shelterData.kommunenr;
    document.querySelector("#modalGnrBnr").innerHTML = "gnr. " + shelterData.gnr + ", bnr. " + shelterData.bnr;
    document.querySelector("#modalKommune").innerHTML = shelterData.kommune;
    document.querySelector("#modalDistriktsnavn").innerHTML = shelterData.distriktsnavn;
    document.querySelector("#modalKategori").innerHTML = shelterData.kategori;
    document.querySelector("#modalPlasser").innerHTML = shelterData.plasser;
    document.querySelector("#modalRomstype").innerHTML = shelterData.romtype;
    document.querySelector("#modalImg").setAttribute("alt", "Streetview av " + shelterData.adresse);

    // init close modal event
    document.querySelector("#expandCard").querySelector("#closeModal").addEventListener("click", () => document.body.style.overflowY = "scroll");

    // create map and display
    $('#expandCard').modal('show');
    document.querySelector("#expandCard").querySelector(".modal-body").style.filter = "blur(10px)";
    setTimeout(function(){
        createMap(mapEle, lat, lng, true);
    }, 300);
}

// remove URL-hash for deep-linking
function removeHash () { 
    let scrollV;
    let scrollH;
    const loc = window.location;
    if ("pushState" in history) {
        history.pushState("", document.title, loc.pathname + loc.search);
    }

    else {
        // prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        // set hash to nothing
        loc.hash = "";

        // restore the scroll offset
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

// share page functions
function share() {
	const facebook = document.querySelector("#shareFacebook");
	facebook.href = "http://www.facebook.com/sharer.php?u=" +  window.location.href;

	const linkedin = document.querySelector("#shareLinkedin");
	linkedin.href = "http://www.linkedin.com/shareArticle?mini=true&amp;url=" +  window.location.href;

	const twitter = document.querySelector("#shareTwitter");
	twitter.href = "https://twitter.com/share?url=" +  window.location.href;

	const google = document.querySelector("#shareGoogle");
	google.href = "https://plus.google.com/share?url=" +  window.location.href;

	const mail = document.querySelector("#shareEmail");
	mail.href = "mailto:?Subject=" +  window.location.href;
}

// initalize keyup form check for UX
let inputs;
function formInit() {
    inputs = document.querySelectorAll(".modal-body")[2].querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("keyup", isValid);
    });

    function isValid() {
        if (this.value.length > 0) {
            this.className = "form-control formOk";
        }

        else {
            this.className = "form-control";
        }
    }
}

// form check
function formCheck() {
    let count = 0;
    let userValues = [];
    inputs = document.querySelectorAll(".modal-body")[2].querySelectorAll("input");
    inputs.forEach(input => {
        // display errors and prevent default behavior
        if (input.value === "") {
            input.className = "form-control invalid animated shake";

            // only display one toast
            if (document.querySelectorAll(".toast").length === 0) {
                toastr["error"]("Vennligst fyll ut manglende felt");
            }

            // focus first invalid input
            setTimeout(function(){
                input.className = "form-control invalid";
                document.querySelectorAll(".invalid")[0].focus();
            }, 1000);
        }

        // input is OK
        else {
            count++;
            input.className = "form-control formOk";

            // push to array
            userValues.push([input.parentElement.childNodes[3].innerHTML + ": " + input.value]);
        }

        // eveything is good
        if (count === inputs.length) {
            sendForm(userValues);
        }
    });
}

// send shelter form
function sendForm(arr) {

    // create iframe
    const frame = document.createElement("iframe");
    frame.id = "iframe";
    frame.setAttribute("name", "hidden");
    frame.style.display = "none";
    document.body.appendChild(frame);

    // assign data / submit form
    document.querySelector("#shelterArr").value = arr;
    event.preventDefault();
    document.querySelector("#shelterForm").submit();

    // reset values / show message / exit
    setTimeout(function(){
        toastr["success"]("Takk for hjelpen! Informasjonen vil bli gått gjennom før den legges til");
        inputs.forEach(input => {
            frame.remove();
            input.value = "";
            input.className = "form-control";
            document.querySelector("#cancelSendInfoShelter").click();
        });
    }, 1000);
}
