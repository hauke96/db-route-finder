import createClient from 'hafas-client';
import dbProfile from 'hafas-client/p/db';
import {Route, RouteComparison, toRoutes} from './route';
import {parseCliArguments} from './cli';
// @ts-ignore
import {data as loyaltyCards} from 'hafas-client/p/db/loyalty-cards';

// API documentation of the hafas-client:
// https://github.com/public-transport/hafas-client/blob/master/docs/journeys.md

const loyaltyCardConfig = {type: loyaltyCards.BAHNCARD, discount: 25};
const transferTime = 15;

const cliArguments = parseCliArguments();
const fromStation = cliArguments.fromStation;
const fromStationId = cliArguments.fromStationId;
const toStation = cliArguments.toStation;
const toStationId = cliArguments.toStationId;
const departureThereTime = cliArguments.departureThereTime;
const departureBackTime = cliArguments.departureBackTime;

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
    loyaltyCard: loyaltyCardConfig
};

const hafas = createClient(dbProfile, 'my-awesome-program')

hafas.journeys(fromStationId, toStationId, optionsJourneyThere).then(journeysThere => {
    if (journeysThere.journeys && journeysThere.journeys.length > 0) {
        let routesThere = toRoutes([...journeysThere.journeys]);

        handleJourneyBack(routesThere);
    } else {
        console.error("No journeys found from " + cliArguments.fromStation + " to " + cliArguments.toStation);
    }
});

function handleJourneyBack(routesThere: (Route | undefined)[]): void {
    hafas.journeys(toStationId, fromStationId, optionsJourneyBack).then(journeysBack => {
        if (journeysBack.journeys && journeysBack.journeys.length > 0) {
            let routesBack = toRoutes([...journeysBack.journeys]);

            printInfos();

            printHeader();

            const comparisons: (RouteComparison | undefined)[] = [];
            routesThere.forEach(routeThere => {
                routesBack.forEach(routeBack => {
                    comparisons.push(Route.compare(routeThere, routeBack));
                })
            })

            const minPrice = Math.min(...comparisons.filter(c => !!c && c.notices.length === 0).map(c => !!c ? c.price : Number.MAX_VALUE))

            comparisons.forEach((c, i) => RouteComparison.print(c, i, minPrice));
        } else {
            console.error("No journeys found from " + cliArguments.toStation + " to " + cliArguments.fromStation);
        }
    })
}

function printInfos(): void {
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
}

function printHeader(): void {
    let sep = " | ";
    console.log(
        "Nr." + sep +
        "Abfahrt hin" + sep +
        "Ankunft hin" + sep +
        "Umsteige" + sep +
        "Abfahrt rück" + sep +
        "Ankunft rück" + sep +
        "Umsteige" + sep +
        "Reisezeit".padStart(9) + sep +
        "Zeit vor Ort".padStart(12) + sep +
        "Preis".padStart(7) + " | Hinweise")

    let sepLine = "-|-";
    console.log(
        "".padStart(3, "-") + sepLine +
        "".padStart(11, "-") + sepLine +
        "".padStart(11, "-") + sepLine +
        "".padStart(8, "-") + sepLine +
        "".padStart(12, "-") + sepLine +
        "".padStart(12, "-") + sepLine +
        "".padStart(8, "-") + sepLine +
        "".padStart(9, "-") + sepLine +
        "".padStart(12, "-") + sepLine +
        "".padStart(7, "-") + sepLine +
        "--------")
}
