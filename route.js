const {millisToMinutes, minutesToHourString, padZero} = require("./util");

const greenFormat = '\x1b[1;32m%s\x1b[0m';
const grayFormat = '\x1b[0;31m%s\x1b[0m';
const noColorFormat = '%s';

// TODO make these parameters as well
const minimumTimeTillBack = 300; // 5 hours
const maximumPrice = 45;

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
        const priceString = (this.price.toFixed(2) + "").padStart(5)
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

module.exports = {
    Route,
    RouteComparison,
    toRoutes
}
