export function millisToMinutes(millis) {
    return Math.floor((millis / 1000) / 60)
}

// E.g. 70 minutes become 01:10:00
export function minutesToHourString(minutes) {
    return padZero(Math.floor(minutes / 60)) + ":" + padZero(minutes % 60 + "") + ":00";
}

export function padZero(data) {
    return ("" + data).padStart(2, "0")
}
