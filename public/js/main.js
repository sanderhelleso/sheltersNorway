window.onload = start;

function start() {
}

function getShelters(dataset) {
    const getJSON = new XMLHttpRequest();
    getJSON.onreadystatechange = function() {
        if (getJSON.readyState == 4 && getJSON.status == 200) {
           writeShelters(JSON.parse(getJSON.responseText));
        }
    }
    getJSON.open("GET", dataset, true); 
    getJSON.send(null);
}

let mainMap;
function initMap() {

    /*var mapProp= {
        center:new google.maps.LatLng(51.508742,-0.120850),
        zoom:5,
    };

    var mainMap = new google.maps.Map(document.getElementById("googleMap"),mapProp);*/


    const dataset = getShelters("/dataset");
}

let shelterCount = 0;
function writeShelters(shelters) {
    shelters.features.forEach(shelter => {
        shelterCount++;
        
        // shelter coordinates
        const coordinates = shelter.geometry.coordinates;

        // shelter info
        const info = shelter.properties;

        // card container
        const cardCont = document.createElement("div");
        cardCont.className = "col-4";

        // card
        const card = document.createElement("div");
        card.className = "card";

        // card image overlay
        /*const cardOverlay = document.createElement("div");
        cardOverlay.className = "view overlay";

        // card img
        /*const cardImg = document.createElement("img");
        cardImg.className = "card-img-top";
        cardImg.src = "https://mdbootstrap.com/img/Photos/Others/food.jpg";
        cardImg.setAttribute("alt", "Some alt text");*/

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
        btn.className = "btn-floating btn-action ml-auto mr-4 mdb-color lighten-3";
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
        cardFooter.className = "rounded-bottom mdb-color lighten-3 text-center pt-3";

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

        document.querySelector("#sheltersRow").appendChild(cardCont);

        if (shelterCount < 10) {
             createMap(locationMap, coordinates[1], coordinates[0]);
        }
        //console.log(info);
    });
}

function createMap(ele, lat, lng) {
    const mapProp = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 14,
    };

    const map = new google.maps.Map(ele, mapProp);

    const marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
    });
}