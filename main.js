const csv = require("csv-parser");
const fs = require("fs");

function parseCSV(file, headers) {
  const results = [];
  return new Promise(resolve => {
    fs.createReadStream(file)
      .pipe(csv(headers))
      .on("data", data => results.push(data))
      .on("end", () => {
        resolve(results);
      });
  });
}

function checkBetweenDate({ targetDate, startDate, endDate }) {
  function parseDate(dateString) {
    return dateString.split("-");
  }

  function checkInBetween({ target, start, end }) {
    const t = parseInt(target);
    const s = parseInt(start);
    const e = parseInt(end);
    if (t >= s && t <= e) {
      return true;
    }
    return false;
  }
  const [sYear, sMonth, sDay] = parseDate(startDate);
  const [eYear, eMonth, eDay] = parseDate(endDate);
  const [tYear, tMonth, tDay] = parseDate(targetDate);
  if (
    checkInBetween({ target: tYear, start: sYear, end: eYear }) &&
    checkInBetween({ target: tMonth, start: sMonth, end: eMonth }) &&
    checkInBetween({ target: tDay, start: sDay, end: eDay })
  ) {
    return true;
  }
  return false;
}

function findNearbyProps(searchLat, searchLng, propertyData, range) {
  var result = [];
  propertyData.map(({ id, lat, lng, nightly_price }) => {
    var latDiff = Math.abs(searchLat - lat);
    var lngDiff = Math.abs(searchLng - lng);
    if (latDiff > range || lngDiff > range) {
      return false;
    }
    result.push({ id, nightly_price });
  });
  return result;
}

function checkIfUnavailable({ propID, startStay, endStay, database }) {
  const variablePropArr = database.filter(d => d.id === propID);
  if (variablePropArr.length === 0) {
    return [];
  } else {
    const unavailableProps = variablePropArr.filter(vProp => {
      const isBetween = checkBetweenDate({
        targetDate: vProp.date,
        startDate: startStay,
        endDate: endStay
      });
      return isBetween === true && vProp.availability === "0";
    });
    return unavailableProps;
  }
}

// Too messy. Wrong function
// function getVariableProp({ propID, searchStart, searchEnd, data }) {
//   const variablePropArr = data.filter(d => d.id === propID);
//   if (variablePropArr.length !== 0) {
//     const variableProp = variablePropArr.filter(vProp => {
//       const isBetween = checkBetweenDate({
//         targetDate: vProp.date,
//         startDate: searchStart,
//         endDate: searchEnd
//       });
//       if (isBetween === true && vProp.availability === "1") {
//         return true;
//       }
//     });
//     return variableProp;
//   }
// }

async function main() {
  const variableProperties = await parseCSV("./calendar.csv", [
    "id",
    "date",
    "availability",
    "price"
  ]);
  const allProperties = await parseCSV("./properties.csv", [
    "id",
    "lat",
    "lng",
    "nightly_price"
  ]);
  const propertySearch = await parseCSV("./searches.csv", [
    "id",
    "lat",
    "lng",
    "start",
    "end"
  ]);

  for (var p of propertySearch) {
    const {
      lat: searchLat,
      lng: searchLng,
      start: searchStart,
      end: searchEnd
    } = p;

    // find all the nearby props within the search radius requirement of 2
    const nearbyProps = findNearbyProps(searchLat, searchLng, allProperties, 2);

    // check if property is listed as unavailable within the date range
    const nearbyPropsAvailable = nearbyProps.filter(
      prop =>
        checkIfUnavailable({
          propID: prop.id,
          startStay: searchStart,
          endStay: searchEnd,
          database: variableProperties
        }).length === 0
    );
    /**
     * PSUODO CODE =================
     *  nearbyPropsAvailable.sort( (nightly_price), "ASC").head(10)  // take the first 10 props sorted by nightly_price
     *
     *
     *
     */
  }
}
main();
