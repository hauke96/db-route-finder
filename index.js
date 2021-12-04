const createClient = require('hafas-client')
const dbProfile = require('hafas-client/p/db')
const data = require('hafas-client/p/db/loyalty-cards').data
const util = require('util');
const stationen = require("./stationen");

// API documentation of the hafas-client:
// https://github.com/public-transport/hafas-client/blob/master/docs/journeys.md

const greenFormat = '\x1b[1;32m%s\x1b[0m';
const grayFormat = '\x1b[0;31m%s\x1b[0m';
const noColorFormat = '%s';

let fromStation = 'Hamburg Hbf';
let toStation = 'Fulda';
let fromStationId = stationen[fromStation];
let toStationId = stationen[toStation];

let departureThereString = '2021-12-20T07:00:00';
let departureBackString = '2021-12-20T15:00:00';
let departureThereTime = new Date(departureThereString);
let departureBackTime = new Date(departureBackString);

const minimumTimeTillBack = 300; // 5 hours
const maximumPrice = 45;
const loyaltyCardConfig = {type: data.BAHNCARD, discount: 25};
const transferTime = 15;

class Route {
    constructor(departure, arrival, transfers, price) {
        this.departure = departure;
        this.arrival = arrival;
        this.transfers = transfers;
        this.price = price;
    }

    // Travel time in minutes
    travelTime() {
        return millisToMinutes(this.arrival - this.departure)
    }

    compare(otherJourney) {
        const travelTime = this.travelTime() + otherJourney.travelTime();
        const timeTillBackJourney = millisToMinutes(otherJourney.departure - this.arrival);
        const price = this.price + otherJourney.price;

        return new RouteComparison(this.departure,
            this.arrival,
            this.transfers,
            otherJourney.departure,
            otherJourney.arrival,
            otherJourney.transfers,
            travelTime,
            timeTillBackJourney,
            price)
    }
}

class RouteComparison {
    constructor(departure, arrival, transfersThere, departureBack, arrivalBack, transfersBack, travelTime, timeTillBackJourney, price) {
        this.departure = departure;
        this.arrival = arrival;
        this.transfersThere = transfersThere;

        this.departureBack = departureBack;
        this.arrivalBack = arrivalBack;
        this.transfersBack = transfersBack;

        this.travelTime = travelTime;
        this.timeTillBackJourney = timeTillBackJourney;
        this.price = price;

        this.notices = [];
        if (this.timeTillBackJourney < minimumTimeTillBack) {
            this.notices.push("Zu wenig Zeit");
        }
        if (this.price > maximumPrice) {
            this.notices.push("Zu teuer");
        }
    }

    print(minPrice) {
        const travelTimeString = minutesToHourString(this.travelTime).padStart(9);
        const timeTillBackString = minutesToHourString(this.timeTillBackJourney).padStart(12);
        const priceString = (this.price + "").padStart(5)
        const priceSuffix = minPrice === this.price ? " *" : "  ";

        let departureThereString = (padZero(this.departure.getHours()) + ":" + padZero(this.departure.getMinutes())).padStart(11);
        let arrivalThereString = (padZero(this.arrival.getHours()) + ":" + padZero(this.arrival.getMinutes())).padStart(11);
        let transfersThere = ("" + this.transfersThere).padStart(8);

        let departureBackString = (padZero(this.departureBack.getHours()) + ":" + padZero(this.departureBack.getMinutes())).padStart(12);
        let arrivalBackString = (padZero(this.arrivalBack.getHours()) + ":" + padZero(this.arrivalBack.getMinutes())).padStart(12);
        let transfersBack = ("" + this.transfersBack).padStart(8);

        let colorFormat = noColorFormat;
        if (this.notices.length > 0) {
            colorFormat = grayFormat;
        } else if (minPrice === this.price) {
            colorFormat = greenFormat;
        }

        let sep = " | ";
        console.log(colorFormat,
            departureThereString + sep +
            arrivalThereString + sep +
            transfersThere + sep +

            departureBackString + sep +
            arrivalBackString + sep +
            transfersBack + sep +

            travelTimeString + sep +
            timeTillBackString + sep +
            priceString + priceSuffix + sep +
            this.notices.join(", "));
    }
}

let args = process.argv.slice(2);

if(args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0)
}

fromStation = args[0];
fromStationId = stationen[fromStation];
if(!fromStationId) {
    console.error("Station of journey there not found.")
    process.exit(1)
}

departureThereString = args[1]
departureThereTime = new Date(departureThereString)
if(!(departureThereTime instanceof Date) || isNaN(departureThereTime)) {
    console.error("Departure time of journey there invalid.")
    process.exit(1)
}

toStation = args[2];
toStationId = stationen[toStation];
if(!toStationId) {
    console.error("Station of journey back not found.")
    process.exit(1)
}

departureBackString = args[3]
departureBackTime = new Date(departureBackString)
if(!(departureBackTime instanceof Date) || isNaN(departureBackTime)) {
    console.error("Departure time of journey back invalid.")
    process.exit(1)
}

const optionsJourneyThere = {
    departure: departureThereTime,
    results: 5,
    transferTime: transferTime,
    loyaltyCard: loyaltyCardConfig
};
const optionsJourneyBack = {
    departure: departureBackTime,
    results: 5,
    transferTime: transferTime,
    loyaltyCard: {type: data.BAHNCARD, discount: 25}
};

const hafas = createClient(dbProfile, 'my-awesome-program')
hafas.journeys(fromStationId, toStationId, optionsJourneyThere).then(journeysThere => {
    let routesThere = toRoutes(journeysThere.journeys);

    hafas.journeys(toStationId, fromStationId, optionsJourneyBack).then(journeysBack => {
        let routesBack = toRoutes(journeysBack.journeys);

        console.log("Von:")
        console.log("  " + fromStation)
        console.log("  Abfahrt hin am " + departureThereTime.toLocaleDateString() + " ab " + departureThereTime.toLocaleTimeString())

        console.log("Nach:")
        console.log("  " + toStation)
        console.log("  Abfahrt zurück am " + departureBackTime.toLocaleDateString() + " ab " + departureBackTime.toLocaleTimeString())

        console.log("Mit BC 25   : " + (loyaltyCardConfig?.discount ? "Ja" : "Nein"));
        console.log("Umsteigezeit: " + transferTime + " Minuten");
        console.log("Abgefragt am: " + new Date().toLocaleString());

        console.log()

        let sep = " | ";
        console.log("Abfahrt hin" + sep +
            "Ankunft hin" + sep +
            "Umsteige" + sep +
            "Abfahrt rück" + sep +
            "Ankunft rück" + sep +
            "Umsteige" + sep +
            "Reisezeit".padStart(9) + sep +
            "Zeit vor Ort".padStart(12) + sep +
            "Preis".padStart(7) + " | Hinweise")

        let sepLine = "-|-";
        console.log("".padStart(11, "-") + sepLine +
            "".padStart(11, "-") + sepLine +
            "".padStart(8, "-") + sepLine +
            "".padStart(12, "-") + sepLine +
            "".padStart(12, "-") + sepLine +
            "".padStart(8, "-") + sepLine +
            "".padStart(9, "-") + sepLine +
            "".padStart(12, "-") + sepLine +
            "".padStart(7, "-") + sepLine +
            "--------")

        const comparisons = [];
        routesThere.forEach(routeThere => {
            routesBack.forEach(routeBack => {
                comparisons.push(routeThere.compare(routeBack));
            })
        })

        const minPrice = Math.min(...comparisons.filter(c => c.notices.length === 0).map(c => c.price))

        comparisons.forEach(c => c.print(minPrice));
    })
})

function toRoutes(journeys) {
    return journeys.map(journey => {
        let lastLeg = journey.legs[journey.legs.length - 1];
        let firstLeg = journey.legs[0];

        return new Route(
            new Date(firstLeg.departure ?? firstLeg.plannedDeparture),
            new Date(lastLeg.arrival ?? lastLeg.plannedArrival),
            journey.legs.length - 1,
            journey.price.amount
        );
    })
}

function millisToMinutes(millis) {
    return Math.floor((millis / 1000) / 60)
}

// E.g. 70 minutes become 01:10:00
function minutesToHourString(minutes) {
    return padZero(Math.floor(minutes / 60)) + ":" + padZero(minutes % 60 + "") + ":00";
}

function padZero(data) {
    return ("" + data).padStart(2, "0")
}

function printHelp() {
    console.log("Usage: node index.js <from> <from-departure> <to> <to-departure>")
    console.log(    )
    console.log("Parameters:")
    console.log("  from             The Station name where your journey starts.")
    console.log("  from-departure   The earliest time you are willing to depart.")
    console.log("  to               The Station you want to go to.")
    console.log("  to-departure     The earliest time you want to head back home.")
    console.log()
    console.log("Example:")
    console.log("  node index.js \"Hamburg Hbf\" \"2021-12-14 07:23\" Fulda \"2021-12-14 14:50\"")
}
