import {millisToMinutes, minutesToHourString, padZero} from "./util";
import {Journey} from "hafas-client";

const greenFormat = '\x1b[1;32m%s\x1b[0m';
const grayFormat = '\x1b[0;31m%s\x1b[0m';
const noColorFormat = '%s';

// TODO make these parameters as well
const minimumTimeTillBack = 300; // 5 hours
const maximumPrice = 45;

export class Route {
    constructor(public departure: Date,
                public arrival: Date,
                public transfers: number,
                public price: number) {
    }

    // Travel time in minutes
    travelTime(): number {
        return millisToMinutes(this.arrival.getTime() - this.departure.getTime())
    }

    public static compare(journeyA: Route | undefined, journeyB: Route | undefined): (RouteComparison | undefined) {
        if (!journeyA || !journeyB) {
            return undefined;
        }

        const travelTime = journeyA.travelTime() + journeyB.travelTime();
        const timeTillBackJourney = millisToMinutes(journeyB.departure.getTime() - journeyA.arrival.getTime());
        const price = journeyA.price + journeyB.price;

        return new RouteComparison(journeyA.departure,
            journeyA.arrival,
            journeyA.transfers,
            journeyB.departure,
            journeyB.arrival,
            journeyB.transfers,
            travelTime,
            timeTillBackJourney,
            price)
    }
}

export class RouteComparison {
    public notices: string[];

    constructor(public departure: Date,
                public arrival: Date,
                public transfersThere: number,
                public departureBack: Date,
                public arrivalBack: Date,
                public transfersBack: number,
                public travelTime: number,
                public timeTillBackJourney: number,
                public price: number) {
        this.notices = [];
        if (this.timeTillBackJourney < minimumTimeTillBack) {
            this.notices.push("Zu wenig Zeit");
        }
        if (this.price > maximumPrice) {
            this.notices.push("Zu teuer");
        }
    }

    public static print(comparison: RouteComparison | undefined, index: number, minPrice: number): void {
        if (!comparison) {
            // TODO When padding array exists (s. below), print nice row with "?" in every column (or similar).
            console.log("???");
            return;
        }

        // TODO Extract padding sizes into global array and use it here and in the table header.

        const travelTimeString = minutesToHourString(comparison.travelTime).padStart(9);
        const timeTillBackString = minutesToHourString(comparison.timeTillBackJourney).padStart(12);
        const priceString = (comparison.price.toFixed(2) + "").padStart(5)
        const priceSuffix = minPrice === comparison.price ? " *" : "  ";

        let departureThereString = (padZero(comparison.departure.getHours()) + ":" + padZero(comparison.departure.getMinutes())).padStart(11);
        let arrivalThereString = (padZero(comparison.arrival.getHours()) + ":" + padZero(comparison.arrival.getMinutes())).padStart(11);
        let transfersThere = ("" + comparison.transfersThere).padStart(8);

        let departureBackString = (padZero(comparison.departureBack.getHours()) + ":" + padZero(comparison.departureBack.getMinutes())).padStart(12);
        let arrivalBackString = (padZero(comparison.arrivalBack.getHours()) + ":" + padZero(comparison.arrivalBack.getMinutes())).padStart(12);
        let transfersBack = ("" + comparison.transfersBack).padStart(8);

        let colorFormat = noColorFormat;
        if (comparison.notices.length > 0) {
            colorFormat = grayFormat;
        } else if (minPrice === comparison.price) {
            colorFormat = greenFormat;
        }

        let sep = " | ";
        console.log(colorFormat,
            ("" + index).padStart(3) + sep +
            departureThereString + sep +
            arrivalThereString + sep +
            transfersThere + sep +

            departureBackString + sep +
            arrivalBackString + sep +
            transfersBack + sep +

            travelTimeString + sep +
            timeTillBackString + sep +
            priceString + priceSuffix + sep +
            comparison.notices.join(", "));
    }
}

export function toRoutes(journeys: Journey[]): (Route | undefined)[] {
    return journeys.map(journey => {
        let lastLeg = journey.legs[journey.legs.length - 1];
        let firstLeg = journey.legs[0];

        if ((!firstLeg.departure || !firstLeg.plannedDeparture) ||
            (!lastLeg.arrival || !lastLeg.plannedArrival) ||
            !journey.price) {
            return undefined;
        }

        return new Route(
            new Date(firstLeg.departure ?? firstLeg.plannedDeparture),
            new Date(lastLeg.arrival ?? lastLeg.plannedArrival),
            journey.legs.length - 1,
            journey.price.amount
        );
    })
}
