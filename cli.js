const stationen = require("./stationen");

function parseCliArguments() {
    let args = process.argv.slice(2);

    if (args[0] === "--help" || args[0] === "-h") {
        printHelp();
        process.exit(0)
    }

    const fromStation = args[0];
    const fromStationId = stationen[fromStation];
    if (!fromStationId) {
        console.error("Station of journey there not found.")
        process.exit(1)
    }

    const departureThereString = args[1]
    const departureThereTime = new Date(departureThereString)
    if (!(departureThereTime instanceof Date) || isNaN(departureThereTime)) {
        console.error("Departure time of journey there invalid.")
        process.exit(1)
    }

    const toStation = args[2];
    const toStationId = stationen[toStation];
    if (!toStationId) {
        console.error("Station of journey back not found.")
        process.exit(1)
    }

    const departureBackString = args[3]
    const departureBackTime = new Date(departureBackString)
    if (!(departureBackTime instanceof Date) || isNaN(departureBackTime)) {
        console.error("Departure time of journey back invalid.")
        process.exit(1)
    }

    return {
        fromStation,
        fromStationId,
        toStation,
        toStationId,
        departureThereTime,
        departureBackTime
    }
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

module.exports = {
    parseCliArguments
}
