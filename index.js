const createClient = require('hafas-client')
const dbProfile = require('hafas-client/p/db')
const data = require('hafas-client/p/db/loyalty-cards').data
const {toRoutes} = require("./route");
const {parseCliArguments} = require("./cli");

// API documentation of the hafas-client:
// https://github.com/public-transport/hafas-client/blob/master/docs/journeys.md

const loyaltyCardConfig = {type: data.BAHNCARD, discount: 25};
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
    loyaltyCard: {type: data.BAHNCARD, discount: 25}
};

const hafas = createClient(dbProfile, 'my-awesome-program')

hafas.journeys(fromStationId, toStationId, optionsJourneyThere).then(journeysThere => {
    let routesThere = toRoutes(journeysThere.journeys);

    hafas.journeys(toStationId, fromStationId, optionsJourneyBack).then(journeysBack => {
        let routesBack = toRoutes(journeysBack.journeys);

        printInfos();

        printHeader();

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


function printInfos() {
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

function printHeader() {
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
}
