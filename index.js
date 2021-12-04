const createClient = require('hafas-client')
const dbProfile = require('hafas-client/p/db')
const data = require('hafas-client/p/db/loyalty-cards').data
const util = require('util');

class Route {
	constructor(departure, arrival, numberChanges, price) {
		this.departure = departure;
		this.arrival = arrival;
		this.numberChanges = numberChanges;
		this.price = price;
	}
}

const hafas = createClient(dbProfile, 'my-awesome-program')
hafas.journeys('8002549', '8000115', {
	results: 3,
	loyaltyCard: {type: data.BAHNCARD, discount: 25}
})
	.then(({journeys}) => {
		console.log(toRoutes(journeys))
	})

// create a client with DB profile
//const client = createClient(dbProfile, 'my-awesome-program')

function toRoutes(journeys) {
	return journeys.map(journey => {
		let lastLeg = journey.legs[journey.legs.length-1];
		let firstLeg = journey.legs[0];

		let route = new Route(
			new Date(firstLeg.departure ?? firstLeg.plannedDeparture),
			new Date(lastLeg.arrival ?? lastLeg.plannedArrival),
			journey.legs.length-1,
			journey.price.amount
		);
		// console.log(util.inspect(journey, { depth: null }));
		return route;
	})
}
