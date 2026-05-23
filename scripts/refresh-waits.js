var fs = require("fs");
var https = require("https");
var path = require("path");

var root = path.resolve(__dirname, "..");
var outputPath = path.join(root, "waits.json");
var userAgent = "OpenClaw rayban-disney-nearby (+personal use; https://queue-times.com/)";
var parks = [
  { key: "disneyland", id: 16, name: "Disneyland" },
  { key: "dca", id: 17, name: "Disney California Adventure" }
];

function fetchJson(url, redirects) {
  return new Promise(function (resolve, reject) {
    var req = https.get(
      url,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": userAgent
        },
        timeout: 15000
      },
      function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          res.resume();
          resolve(fetchJson(res.headers.location, redirects - 1));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error("HTTP " + res.statusCode + " for " + url));
          return;
        }
        var chunks = [];
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
        res.on("end", function () {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on("timeout", function () {
      req.destroy(new Error("Timeout fetching " + url));
    });
    req.on("error", reject);
  });
}

function latestIso(values) {
  var latest = null;
  values.forEach(function (value) {
    if (!value) {
      return;
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    if (!latest || date.getTime() > latest.getTime()) {
      latest = date;
    }
  });
  return latest ? latest.toISOString() : null;
}

async function loadPark(park) {
  var url = "https://queue-times.com/parks/" + park.id + "/queue_times.json";
  var data = await fetchJson(url, 3);
  var rides = [];

  (data.lands || []).forEach(function (land) {
    (land.rides || []).forEach(function (ride) {
      rides.push({
        park_key: park.key,
        park: park.name,
        land: land.name || "Unknown land",
        id: ride.id === undefined ? null : ride.id,
        name: ride.name || "Unknown attraction",
        is_open: Boolean(ride.is_open),
        wait_time: Number(ride.wait_time || 0),
        last_updated: ride.last_updated || null
      });
    });
  });

  (data.rides || []).forEach(function (ride) {
    rides.push({
      park_key: park.key,
      park: park.name,
      land: ride.land || "Unknown land",
      id: ride.id === undefined ? null : ride.id,
      name: ride.name || "Unknown attraction",
      is_open: Boolean(ride.is_open),
      wait_time: Number(ride.wait_time || 0),
      last_updated: ride.last_updated || null
    });
  });

  return rides;
}

async function main() {
  var parkPayloads = await Promise.all(parks.map(loadPark));
  var rides = [];
  parkPayloads.forEach(function (parkRides) {
    rides = rides.concat(parkRides);
  });
  rides.sort(function (a, b) {
    return (
      a.park_key.localeCompare(b.park_key) ||
      a.land.localeCompare(b.land) ||
      a.name.localeCompare(b.name)
    );
  });

  var payload = {
    source: "Queue-Times.com public API",
    source_url: "https://queue-times.com/en-US/pages/api",
    unofficial: true,
    generated_at: new Date().toISOString(),
    latest_update: latestIso(rides.map(function (ride) {
      return ride.last_updated;
    })),
    parks: parks.map(function (park) {
      return {
        key: park.key,
        id: park.id,
        name: park.name
      };
    }),
    rides: rides
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + "\n");
  console.log("Wrote " + rides.length + " rides to " + path.relative(process.cwd(), outputPath));
  if (payload.latest_update) {
    console.log("Latest Queue-Times update: " + payload.latest_update);
  }
}

main().catch(function (error) {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
