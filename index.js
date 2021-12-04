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

const fromStation = 'Hamburg Hbf';
const toStation = 'Fulda';
const fromStationId = stationen[fromStation];
const toStationId = stationen[toStation];
const minimumTimeTillBack = 300; // 5 hours
const maximumPrice = 45;
const departureThereString = '2021-12-20T07:00:00';
const departureBackString = '2021-12-20T15:00:00';
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

const optionsJourneyThere = {
    departure: new Date(departureThereString),
    results: 5,
    transferTime: transferTime,
    loyaltyCard: loyaltyCardConfig
};
const optionsJourneyBack = {
    departure: new Date(departureBackString),
    results: 5,
    transferTime: transferTime,
    loyaltyCard: {type: data.BAHNCARD, discount: 25}
};

const hafas = createClient(dbProfile, 'my-awesome-program')
hafas.journeys(fromStationId, toStationId, optionsJourneyThere).then(({journeys}) => {
    let journeysThere = toRoutes(journeys);

    hafas.journeys(toStationId, fromStationId, optionsJourneyBack).then(({journeys}) => {
        let journeysBack = toRoutes(journeys);

        console.log("Von:")
        console.log("  " + fromStation)
        console.log("  Abfahrt hin am " + new Date(departureThereString).toLocaleDateString() + " ab " + new Date(departureThereString).toLocaleTimeString())

        console.log("Nach:")
        console.log("  " + toStation)
        console.log("  Abfahrt zurück am " + new Date(departureBackString).toLocaleDateString() + " ab " + new Date(departureBackString).toLocaleTimeString())

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
        journeysThere.forEach(journeyThere => {
            journeysBack.forEach(journeyBack => {
                comparisons.push(journeyThere.compare(journeyBack));
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

        let route = new Route(
            new Date(firstLeg.departure ?? firstLeg.plannedDeparture),
            new Date(lastLeg.arrival ?? lastLeg.plannedArrival),
            journey.legs.length - 1,
            journey.price.amount
        );
        // console.log(util.inspect(journey, { depth: null }));
        return route;
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
