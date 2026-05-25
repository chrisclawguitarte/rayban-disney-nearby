var fs = require("fs");
var path = require("path");
var zlib = require("zlib");
var vm = require("vm");

var root = path.resolve(__dirname, "..");
var failures = [];

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readPngSize(name) {
  var file = fs.readFileSync(path.join(root, name));
  var signature = file.subarray(0, 8).toString("hex");
  assert(signature === "89504e470d0a1a0a", name + " is a PNG");
  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20)
  };
}

function createElement(id) {
  return {
    id: id,
    textContent: "",
    innerHTML: "",
    disabled: false,
    offsetParent: {},
    focus: function () {},
    click: function () {},
    getBoundingClientRect: function () {
      return { left: 0, top: 0, width: 80, height: 60 };
    },
    addEventListener: function () {},
    classList: {
      toggle: function () {},
      contains: function () {
        return false;
      }
    }
  };
}

var html = read("index.html");
var css = read("styles.css");
var js = read("app.js");
var refresh = read("scripts/refresh-waits.js");
var serviceWorker = read("service-worker.js");
var workflow = read(".github/workflows/refresh-waits.yml");
var manifest = JSON.parse(read("manifest.webmanifest"));
var pkg = JSON.parse(read("package.json"));
var waits = JSON.parse(read("waits.json"));
var elements = {};
[
  "app-status",
  "clock",
  "mode-label",
  "summary-title",
  "fix-label",
  "updated-label",
  "source-label",
  "ride-list",
  "gps-control-label",
  "sync-control-label",
  "park-control-label",
  "open-control-label"
].forEach(function (id) {
  elements[id] = createElement(id);
});

var context = {
  Date: Date,
  Math: Math,
  Number: Number,
  String: String,
  Boolean: Boolean,
  Object: Object,
  Array: Array,
  JSON: JSON,
  RegExp: RegExp,
  fetch: function () {
    return Promise.reject(new Error("fetch disabled in check"));
  },
  localStorage: {
    getItem: function () {
      return null;
    },
    setItem: function () {}
  },
  window: {
    addEventListener: function () {}
  },
  navigator: {
    geolocation: {
      watchPosition: function () {
        return 1;
      },
      clearWatch: function () {}
    },
    serviceWorker: {
      register: function () {
        return Promise.resolve();
      }
    }
  },
  document: {
    readyState: "loading",
    getElementById: function (id) {
      return elements[id] || createElement(id);
    },
    querySelectorAll: function () {
      return [];
    },
    querySelector: function () {
      return null;
    },
    addEventListener: function () {}
  },
  setInterval: function () {},
  console: console
};
context.window.window = context.window;
context.window.navigator = context.navigator;
context.window.document = context.document;
context.window.localStorage = context.localStorage;
context.window.RAYBAN_DISNEY_NEARBY = null;

vm.createContext(context);
vm.runInContext(js, context);
var api = context.window.RAYBAN_DISNEY_NEARBY;

assert(html.indexOf("width=600, height=600") !== -1, "viewport is fixed to 600x600");
assert(html.indexOf('rel="manifest" href="manifest.webmanifest"') !== -1, "manifest is linked");
assert(html.indexOf('rel="icon" href="favicon.png"') !== -1, "favicon is linked");
assert(html.indexOf('id="ride-list"') !== -1, "ride list is present");
assert(html.indexOf('id="summary-title"') !== -1, "summary panel is present");
assert(html.indexOf('data-action="start-gps"') !== -1, "GPS permission control is present");
assert(html.indexOf('data-action="refresh"') !== -1, "data refresh control is present");
assert(html.indexOf('data-action="cycle-filter"') !== -1, "D-pad filter control is present");
assert(html.indexOf('class="focusable control"') !== -1, "focusable controls are present");
assert(html.indexOf('target="_blank"') === -1 && html.indexOf('target="_top"') === -1, "app UI does not use external navigation targets");

assert(css.indexOf("width: 600px") !== -1 && css.indexOf("height: 600px") !== -1, "CSS fixes the 600px canvas");
assert(css.indexOf("overflow: hidden") !== -1, "scrolling is disabled");
assert(css.indexOf("--bg: #000000") !== -1, "black page canvas is defined");
assert(css.indexOf("--focus: #44d7ff") !== -1, "visible cyan focus ring is defined");
assert(css.indexOf("padding: 24px 64px 22px") !== -1, "layout uses a wide display safe area");
assert(css.indexOf("grid-template-rows: repeat(5, 1fr)") !== -1, "ride list uses five roomy rows");
assert(css.indexOf("min-width: 0") !== -1, "grid and flex children can shrink instead of clipping the right edge");
assert(css.indexOf("min-height: 62px") !== -1, "controls have stable large targets");
assert(css.indexOf("letter-spacing: 0") !== -1, "letter spacing is not negative");
assert(css.indexOf("font-size: 28px") !== -1, "summary is the primary readout");

assert(js.indexOf("navigator.geolocation.watchPosition") !== -1, "geolocation watch is used");
assert(js.indexOf("event.preventDefault()") !== -1, "D-pad key handling prevents default browser behavior");
assert(js.indexOf("localStorage") !== -1, "lightweight localStorage state is present");
assert(js.indexOf("serviceWorker") !== -1, "service worker registration is present");
assert(js.indexOf('fetch("./waits.json?ts="') !== -1, "app fetches same-origin wait data");
assert(js.indexOf("HEADLINER_TERMS") !== -1, "quick headliner filter terms are present");
assert(js.indexOf("cycleRideFilter") !== -1, "D-pad filter cycling is present");
assert(js.indexOf("rides.slice(0, 5)") !== -1, "app renders a readable five-ride list");
assert(js.indexOf("queue-times.com/parks") === -1, "app does not directly fetch Queue-Times from the browser");
assert(js.indexOf("window.open") === -1, "app does not use popup navigation");
assert(js.indexOf("window.top.location") === -1, "app does not attempt blocked top-level navigation");
assert(!/client_secret|refresh_token|password\s*=|AIza[0-9A-Za-z_-]{20,}/.test(js), "app JS contains no secrets or API keys");
assert(api && api.attractionCoordinateCount >= 80, "attraction coordinate catalog is broad enough");
assert(api && api.landCoordinateCount >= 15, "land coordinate fallbacks are present");

if (api) {
  var sample = {
    rides: [
      { park_key: "disneyland", park: "Disneyland", land: "New Orleans Square", id: 289, name: "Pirates of the Caribbean", is_open: true, wait_time: 25 },
      { park_key: "disneyland", park: "Disneyland", land: "Tomorrowland", id: 284, name: "Hyperspace Mountain", is_open: true, wait_time: 55 },
      { park_key: "dca", park: "Disney California Adventure", land: "Cars Land", id: 295, name: "Radiator Springs Racers", is_open: true, wait_time: 65 }
    ]
  };
  var sorted = api.getVisibleRidesForTest(sample, { lat: 33.81195, lon: -117.92260 });
  assert(sorted[0] && sorted[0].id === "289", "GPS sorting puts the closest attraction first");
  var headliners = api.getVisibleRidesForTest(sample, null, { rideFilter: "headliners" });
  assert(headliners.length === 2 && headliners.every(function (ride) { return ride.id !== "289"; }), "headliner filter narrows ride list");
  var low = api.getVisibleRidesForTest(sample, null, { rideFilter: "low" });
  assert(low.length === 1 && low[0].id === "289", "low-wait filter narrows ride list");
  assert(api.cardinalFromBearing(0) === "N", "bearing cardinal helper works");
}

assert(refresh.indexOf("https://queue-times.com/parks/") !== -1, "server-side refresh uses Queue-Times parks endpoint");
assert(refresh.indexOf("waits.json") !== -1, "refresh script writes waits.json");
assert(workflow.indexOf('cron: "*/5 * * * *"') !== -1, "GitHub runner refresh is scheduled every five minutes");
assert(workflow.indexOf("node scripts/refresh-waits.js") !== -1, "GitHub runner regenerates waits.json");
assert(workflow.indexOf("node scripts/check.js") !== -1, "GitHub runner validates the app bundle");
assert(workflow.indexOf("actions/deploy-pages@v4") !== -1, "GitHub runner deploys the refreshed Pages artifact");

assert(manifest.name === "Disney Nearby", "manifest name matches app");
assert(manifest.icons && manifest.icons[0] && manifest.icons[0].src === "favicon.png", "manifest references favicon.png");
assert(manifest.background_color === "#000000", "manifest background is black");
assert(manifest.display === "standalone", "manifest uses standalone display");

assert(serviceWorker.indexOf("rayban-disney-nearby-v3") !== -1, "service worker cache name is current");
["./", "./index.html", "./styles.css", "./app.js", "./manifest.webmanifest", "./favicon.png"].forEach(function (asset) {
  assert(serviceWorker.indexOf(asset) !== -1, "service worker caches " + asset);
});
assert(serviceWorker.indexOf("/waits.json") !== -1, "service worker keeps wait data network-first");

assert(pkg.scripts && pkg.scripts.check === "node scripts/check.js", "npm check script is present");
assert(pkg.scripts && pkg.scripts.start === "node server.js", "npm start script is present");
assert(pkg.scripts && pkg.scripts.favicon === "node scripts/make-favicon.js", "npm favicon script is present");
assert(pkg.scripts && pkg.scripts["refresh-waits"] === "node scripts/refresh-waits.js", "npm refresh-waits script is present");

assert(waits.source === "Queue-Times.com public API", "waits.json has source attribution");
assert(Array.isArray(waits.rides) && waits.rides.length >= 70, "waits.json includes resort rides");
assert(waits.rides.some(function (ride) { return ride.park_key === "disneyland"; }), "waits.json includes Disneyland");
assert(waits.rides.some(function (ride) { return ride.park_key === "dca"; }), "waits.json includes DCA");

var size = readPngSize("favicon.png");
assert(size.width >= 53 && size.height >= 53, "favicon is larger than 52x52");

var gzipped = zlib.gzipSync(Buffer.from(js));
assert(gzipped.length < 500 * 1024, "JavaScript is under 500KB gzipped");

if (failures.length) {
  console.error("Check failed:");
  failures.forEach(function (failure) {
    console.error("- " + failure);
  });
  process.exit(1);
}

console.log("All checks passed.");
console.log("rides in waits.json: " + waits.rides.length);
console.log("coordinate catalog: " + api.attractionCoordinateCount + " rides, " + api.landCoordinateCount + " lands");
console.log("app.js gzip bytes: " + gzipped.length);
console.log("favicon: " + size.width + "x" + size.height + " PNG");
