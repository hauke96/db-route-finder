# DB Route Finder

A tool to find routes from A to B and B to A with the following properties:

* All journeys should happen on the same day (A to B and back B to A on the same day)
* The time at B (so between arriving at B and departing from B) should be sufficient (like 5 hours or so)
* The price should be minimal
* The exact departure times are irrelevant as long as everything is on the same day

# Usage

`node index.js "Hamburg Hbf" "2021-12-14 07:23" Fulda "2021-12-14 14:50"`

Or to print helping information:

`node index.js --help`
