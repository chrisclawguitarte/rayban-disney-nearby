(function () {
  "use strict";

  var METERS_TO_MILES = 0.000621371;
  var METERS_TO_FEET = 3.280839895;
  var POSITION_KEY = "raybanDisneyNearby.lastPosition.v1";
  var PARK_KEY = "raybanDisneyNearby.parkFilter.v1";
  var FILTER_KEY = "raybanDisneyNearby.rideFilter.v1";
  var OPEN_ONLY_KEY = "raybanDisneyNearby.openOnly.v1";

  var PARKS = {
    disneyland: {
      name: "Disneyland",
      shortName: "DL",
      center: { lat: 33.8123, lon: -117.9189 }
    },
    dca: {
      name: "Disney California Adventure",
      shortName: "DCA",
      center: { lat: 33.8066, lon: -117.9210 }
    }
  };

  var ATTRACTION_COORDS = {
    "273": [33.81195, -117.91802],
    "274": [33.81435, -117.91705],
    "275": [33.81373, -117.91862],
    "276": [33.81363, -117.91685],
    "277": [33.81348, -117.91882],
    "278": [33.81388, -117.91805],
    "279": [33.81386, -117.91772],
    "280": [33.81324, -117.91867],
    "281": [33.81338, -117.91890],
    "282": [33.81318, -117.91855],
    "283": [33.81316, -117.91882],
    "284": [33.81248, -117.91695],
    "285": [33.81373, -117.91920],
    "286": [33.81223, -117.91755],
    "287": [33.81172, -117.91782],
    "288": [33.81225, -117.92012],
    "289": [33.81192, -117.92254],
    "291": [33.80752, -117.91655],
    "293": [33.80810, -117.92227],
    "294": [33.80782, -117.91680],
    "295": [33.80585, -117.92172],
    "296": [33.81267, -117.92082],
    "298": [33.80527, -117.92263],
    "300": [33.80482, -117.92238],
    "301": [33.80503, -117.92253],
    "302": [33.80777, -117.92295],
    "303": [33.81418, -117.91878],
    "304": [33.81135, -117.92392],
    "305": [33.81402, -117.91843],
    "306": [33.81238, -117.92435],
    "307": [33.81512, -117.91858],
    "310": [33.80450, -117.92303],
    "311": [33.80472, -117.92255],
    "312": [33.80882, -117.92055],
    "313": [33.80442, -117.92335],
    "315": [33.80638, -117.92078],
    "316": [33.80582, -117.92235],
    "317": [33.81402, -117.91655],
    "319": [33.80452, -117.92185],
    "321": [33.80782, -117.91682],
    "322": [33.80398, -117.92202],
    "323": [33.81355, -117.92180],
    "324": [33.81572, -117.91810],
    "326": [33.81252, -117.92182],
    "327": [33.81575, -117.91948],
    "328": [33.81258, -117.92258],
    "329": [33.80658, -117.91772],
    "331": [33.81278, -117.92262],
    "332": [33.81552, -117.91843],
    "456": [33.81280, -117.92242],
    "674": [33.81110, -117.91872],
    "679": [33.81272, -117.92138],
    "684": [33.81562, -117.91903],
    "686": [33.81082, -117.91842],
    "687": [33.81288, -117.91878],
    "690": [33.81074, -117.91838],
    "691": [33.81102, -117.91865],
    "695": [33.81073, -117.91835],
    "868": [33.80784, -117.91680],
    "5557": [33.80472, -117.92255],
    "6339": [33.81412, -117.92215],
    "6340": [33.81458, -117.92300],
    "6440": [33.80730, -117.91635],
    "6643": [33.80422, -117.92282],
    "6711": [33.81295, -117.91846],
    "8843": [33.80692, -117.91703],
    "10903": [33.81412, -117.92215],
    "10904": [33.80585, -117.92172],
    "10905": [33.80503, -117.92253],
    "10906": [33.80398, -117.92202],
    "10907": [33.80692, -117.91703],
    "11526": [33.81555, -117.91890],
    "11980": [33.81582, -117.91862],
    "12428": [33.81272, -117.92058],
    "13814": [33.81598, -117.91895],
    "13958": [33.81282, -117.92335],
    "13959": [33.80630, -117.92278],
    "13960": [33.80430, -117.92320],
    "13961": [33.80682, -117.92142],
    "14168": [33.81255, -117.92415],
    "14326": [33.81255, -117.92415],
    "14742": [33.80528, -117.92275],
    "14915": [33.81074, -117.91838],
    "14923": [33.81074, -117.91838],
    "16254": [33.81518, -117.91795]
  };

  var LAND_COORDS = {
    "disneyland:Adventureland": [33.81255, -117.92075],
    "disneyland:Bayou Country": [33.81245, -117.92405],
    "disneyland:Fantasyland": [33.81370, -117.91865],
    "disneyland:Frontierland": [33.81295, -117.92205],
    "disneyland:Main Street U.S.A": [33.81105, -117.91858],
    "disneyland:Mickey's Toontown": [33.81570, -117.91878],
    "disneyland:New Orleans Square": [33.81225, -117.92295],
    "disneyland:Star Wars: Galaxy's Edge": [33.81435, -117.92265],
    "disneyland:Tomorrowland": [33.81290, -117.91730],
    "dca:Avengers Campus": [33.80680, -117.91735],
    "dca:Cars Land": [33.80635, -117.92135],
    "dca:Grizzly Peak": [33.80820, -117.92210],
    "dca:Hollywood Land": [33.80765, -117.91672],
    "dca:Paradise Gardens Park": [33.80510, -117.92235],
    "dca:Pixar Pier": [33.80435, -117.92265],
    "dca:San Fransokyo Square": [33.80630, -117.92278]
  };

  var HEADLINER_TERMS = [
    "rise of the resistance",
    "radiator springs racers",
    "guardians of the galaxy",
    "web slingers",
    "indiana jones",
    "space mountain",
    "hyperspace mountain"
  ];

  var FILTERS = [
    { key: "open", label: "OPEN", mode: "NEAREST OPEN", kind: "open" },
    { key: "low", label: "LOW", mode: "LOW WAITS", kind: "low", maxWait: 30 },
    { key: "headliners", label: "TOP", mode: "TOP RIDES", kind: "terms", terms: HEADLINER_TERMS },
    { key: "rise", label: "RISE", mode: "RIDE RISE", kind: "terms", terms: ["rise of the resistance"], specific: true },
    { key: "racer", label: "RACE", mode: "RIDE RACERS", kind: "terms", terms: ["radiator springs racers"], specific: true },
    { key: "guard", label: "GOTG", mode: "RIDE GOTG", kind: "terms", terms: ["guardians of the galaxy"], specific: true },
    { key: "web", label: "WEB", mode: "RIDE WEB", kind: "terms", terms: ["web slingers"], specific: true },
    { key: "space", label: "SPACE", mode: "RIDE SPACE", kind: "terms", terms: ["space mountain", "hyperspace mountain"], specific: true },
    { key: "indy", label: "INDY", mode: "RIDE INDY", kind: "terms", terms: ["indiana jones"], specific: true },
    { key: "all", label: "ALL", mode: "NEAREST ALL", kind: "all" }
  ];

  var dom = {};
  var state = {
    waitData: null,
    rides: [],
    locationWatchId: null,
    lastPosition: readLastPosition(),
    lastFixAt: 0,
    parkFilter: localStorage.getItem(PARK_KEY) || "both",
    rideFilter: readInitialFilter(),
    loading: false,
    lastError: ""
  };

  function init() {
    dom.status = document.getElementById("app-status");
    dom.clock = document.getElementById("clock");
    dom.mode = document.getElementById("mode-label");
    dom.summary = document.getElementById("summary-title");
    dom.fix = document.getElementById("fix-label");
    dom.updated = document.getElementById("updated-label");
    dom.source = document.getElementById("source-label");
    dom.list = document.getElementById("ride-list");
    dom.gpsControl = document.getElementById("gps-control-label");
    dom.syncControl = document.getElementById("sync-control-label");
    dom.parkControl = document.getElementById("park-control-label");
    dom.openControl = document.getElementById("open-control-label");

    updateClock();
    setInterval(updateClock, 1000);
    setInterval(render, 1000);
    bindControls();
    bindDpadNavigation();
    focusPreferredControl();
    render();
    loadWaits();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("./service-worker.js").catch(function () {});
      });
    }
  }

  function bindControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-action]"), function (button) {
      button.addEventListener("click", function () {
        handleAction(button.getAttribute("data-action"));
      });
    });
  }

  function bindDpadNavigation() {
    document.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        event.preventDefault();
        moveFocus(key);
      }
      if (key === "Enter" || key === " ") {
        var target = document.activeElement;
        if (target && target.classList.contains("focusable")) {
          event.preventDefault();
          target.click();
        }
      }
      if (key === "Escape" || key === "Backspace") {
        event.preventDefault();
        render();
      }
    });
  }

  function handleAction(action) {
    if (action === "start-gps") {
      startGps();
    }
    if (action === "refresh") {
      loadWaits();
    }
    if (action === "cycle-park") {
      cyclePark();
    }
    if (action === "cycle-filter") {
      cycleRideFilter();
      render();
    }
  }

  function focusPreferredControl() {
    var preferred = document.querySelector("[data-preferred-focus]") || document.querySelector(".focusable");
    if (preferred) {
      preferred.focus();
      updateFocusClass(preferred);
    }
  }

  function moveFocus(key) {
    var items = Array.prototype.filter.call(document.querySelectorAll(".focusable"), function (item) {
      return !item.disabled && item.offsetParent !== null;
    });
    if (!items.length) {
      return;
    }

    var current = document.activeElement && document.activeElement.classList.contains("focusable")
      ? document.activeElement
      : items[0];
    var currentRect = current.getBoundingClientRect();
    var currentCenter = centerOf(currentRect);
    var best = null;
    var bestScore = Infinity;

    items.forEach(function (item) {
      if (item === current) {
        return;
      }
      var rect = item.getBoundingClientRect();
      var center = centerOf(rect);
      var dx = center.x - currentCenter.x;
      var dy = center.y - currentCenter.y;
      var primary = 0;
      var secondary = 0;

      if (key === "ArrowRight" && dx > 0) {
        primary = dx;
        secondary = Math.abs(dy);
      } else if (key === "ArrowLeft" && dx < 0) {
        primary = Math.abs(dx);
        secondary = Math.abs(dy);
      } else if (key === "ArrowDown" && dy > 0) {
        primary = dy;
        secondary = Math.abs(dx);
      } else if (key === "ArrowUp" && dy < 0) {
        primary = Math.abs(dy);
        secondary = Math.abs(dx);
      } else {
        return;
      }

      var score = primary + secondary * 1.75;
      if (score < bestScore) {
        bestScore = score;
        best = item;
      }
    });

    if (!best) {
      var index = items.indexOf(current);
      if (key === "ArrowRight" || key === "ArrowDown") {
        best = items[(index + 1) % items.length];
      } else {
        best = items[(index - 1 + items.length) % items.length];
      }
    }

    best.focus();
    updateFocusClass(best);
  }

  function centerOf(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function updateFocusClass(active) {
    Array.prototype.forEach.call(document.querySelectorAll(".focusable"), function (item) {
      item.classList.toggle("is-focused", item === active);
    });
  }

  function startGps() {
    if (!navigator.geolocation) {
      state.lastError = "GPS unavailable";
      setStatus("NO GPS");
      render();
      return;
    }

    setStatus("GPS");
    if (state.locationWatchId !== null) {
      navigator.geolocation.clearWatch(state.locationWatchId);
      state.locationWatchId = null;
    }

    state.locationWatchId = navigator.geolocation.watchPosition(
      function (position) {
        state.lastPosition = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy || null,
          timestamp: position.timestamp || Date.now()
        };
        state.lastFixAt = Date.now();
        state.lastError = "";
        writeLastPosition(state.lastPosition);
        setStatus("LIVE");
        render();
      },
      function (error) {
        state.lastError = error && error.message ? error.message : "Location blocked";
        setStatus("GPS ERR");
        render();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 12000
      }
    );
  }

  function cyclePark() {
    if (state.parkFilter === "both") {
      state.parkFilter = "disneyland";
    } else if (state.parkFilter === "disneyland") {
      state.parkFilter = "dca";
    } else {
      state.parkFilter = "both";
    }
    localStorage.setItem(PARK_KEY, state.parkFilter);
    render();
  }

  function cycleRideFilter() {
    var index = filterIndex(state.rideFilter);
    var next = FILTERS[(index + 1) % FILTERS.length];
    state.rideFilter = next.key;
    localStorage.setItem(FILTER_KEY, state.rideFilter);
  }

  function loadWaits() {
    state.loading = true;
    state.lastError = "";
    setStatus("SYNC");
    render();
    return fetch("./waits.json?ts=" + Date.now(), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("waits.json " + response.status);
        }
        return response.json();
      })
      .then(function (payload) {
        state.waitData = payload;
        state.rides = normalizeWaits(payload);
        state.loading = false;
        setStatus(state.locationWatchId !== null ? "LIVE" : "READY");
        render();
      })
      .catch(function (error) {
        state.loading = false;
        state.lastError = error && error.message ? error.message : "Data unavailable";
        setStatus("DATA ERR");
        render();
      });
  }

  function normalizeWaits(payload) {
    var rawRides = payload && Array.isArray(payload.rides) ? payload.rides : [];
    return rawRides.map(function (raw) {
      var parkKey = raw.park_key || inferParkKey(raw.park);
      var park = PARKS[parkKey] || PARKS.disneyland;
      var coord = resolveCoord(raw, parkKey, park);
      return {
        id: raw.id === null || raw.id === undefined ? "" : String(raw.id),
        parkKey: parkKey,
        park: raw.park || park.name,
        parkShort: park.shortName,
        land: raw.land || "Unknown land",
        name: raw.name || "Unknown attraction",
        isOpen: Boolean(raw.is_open),
        waitTime: Number(raw.wait_time || 0),
        lastUpdated: raw.last_updated || null,
        coord: coord.coord,
        coordSource: coord.source
      };
    });
  }

  function inferParkKey(name) {
    if ((name || "").toLowerCase().indexOf("california") !== -1) {
      return "dca";
    }
    return "disneyland";
  }

  function resolveCoord(raw, parkKey, park) {
    var id = raw.id === null || raw.id === undefined ? "" : String(raw.id);
    var exact = ATTRACTION_COORDS[id];
    if (exact) {
      return { coord: toCoord(exact), source: "ride" };
    }
    var land = LAND_COORDS[parkKey + ":" + (raw.land || "")];
    if (land) {
      return { coord: toCoord(land), source: "land" };
    }
    return { coord: park.center, source: "park" };
  }

  function toCoord(pair) {
    return { lat: pair[0], lon: pair[1] };
  }

  function getVisibleRides() {
    var position = state.lastPosition;
    var filter = currentFilter();
    var rides = state.rides.filter(function (ride) {
      if (!filter.specific && state.parkFilter !== "both" && ride.parkKey !== state.parkFilter) {
        return false;
      }
      return rideMatchesFilter(ride, filter);
    });

    rides = rides.map(function (ride) {
      var withDistance = Object.assign({}, ride);
      if (position) {
        withDistance.distanceMeters = haversineMeters(position, ride.coord);
        withDistance.bearing = bearingDegrees(position, ride.coord);
      } else {
        withDistance.distanceMeters = null;
        withDistance.bearing = null;
      }
      return withDistance;
    });

    if (position) {
      return rides.sort(function (a, b) {
        return a.distanceMeters - b.distanceMeters || a.waitTime - b.waitTime || a.name.localeCompare(b.name);
      });
    }

    return rides.sort(function (a, b) {
      return a.waitTime - b.waitTime || a.parkShort.localeCompare(b.parkShort) || a.name.localeCompare(b.name);
    });
  }

  function render() {
    if (!dom.status) {
      return;
    }

    var rides = getVisibleRides();
    var top = rides[0] || null;
    dom.mode.textContent = modeLabel();
    dom.fix.textContent = fixLabel();
    dom.updated.textContent = updatedLabel();
    dom.source.textContent = "Queue-Times.com public API • unofficial";
    dom.gpsControl.textContent = state.locationWatchId !== null ? "GPS ON" : "GPS";
    dom.syncControl.textContent = state.loading ? "..." : "DATA";
    dom.parkControl.textContent = parkLabel();
    dom.openControl.textContent = currentFilter().label;

    if (state.lastError) {
      dom.summary.textContent = state.lastError.toUpperCase();
    } else if (!state.waitData && state.loading) {
      dom.summary.textContent = "LOADING WAITS";
    } else if (!state.rides.length) {
      dom.summary.textContent = "NO WAIT DATA";
    } else if (top) {
      dom.summary.textContent = summaryTitle(top);
    } else {
      dom.summary.textContent = "NO MATCHES";
    }

    renderRideList(rides);
  }

  function renderRideList(rides) {
    var visible = rides.slice(0, 5);
    if (!visible.length) {
      dom.list.innerHTML = '<div class="empty-state">No matching attractions</div>';
      return;
    }
    dom.list.innerHTML = visible.map(renderRideCard).join("");
  }

  function renderRideCard(ride) {
    var waitClass = "wait-pill";
    if (!ride.isOpen) {
      waitClass += " is-closed";
    } else if (ride.waitTime >= 45) {
      waitClass += " is-long";
    } else if (ride.waitTime >= 20) {
      waitClass += " is-medium";
    }

    return [
      '<article class="ride-card">',
      '<div class="ride-top">',
      '<div class="ride-name">' + escapeHtml(displayName(ride.name)) + "</div>",
      '<div class="' + waitClass + '">' + escapeHtml(formatWait(ride)) + "</div>",
      "</div>",
      '<div class="ride-meta">',
      '<span class="ride-distance">' + escapeHtml(distanceAndBearing(ride)) + "</span>",
      '<span class="ride-park">' + escapeHtml(ride.parkShort) + "</span>",
      '<span class="ride-land">' + escapeHtml(ride.land) + "</span>",
      "</div>",
      "</article>"
    ].join("");
  }

  function modeLabel() {
    var filter = currentFilter();
    if (filter.specific) {
      return filter.mode;
    }
    return parkLabel() + " " + filter.mode;
  }

  function currentFilter() {
    return FILTERS[filterIndex(state.rideFilter)];
  }

  function filterIndex(key) {
    for (var index = 0; index < FILTERS.length; index += 1) {
      if (FILTERS[index].key === key) {
        return index;
      }
    }
    return 0;
  }

  function rideMatchesFilter(ride, filter) {
    if (filter.kind === "all") {
      return true;
    }
    if (filter.kind === "open") {
      return ride.isOpen;
    }
    if (filter.kind === "low") {
      return ride.isOpen && ride.waitTime <= filter.maxWait;
    }
    if (filter.kind === "terms") {
      if (!filter.specific && !ride.isOpen) {
        return false;
      }
      return matchesTerms(ride, filter.terms || []);
    }
    return true;
  }

  function matchesTerms(ride, terms) {
    var haystack = normalizeSearchText(ride.name + " " + ride.land);
    return terms.some(function (term) {
      return haystack.indexOf(normalizeSearchText(term)) !== -1;
    });
  }

  function normalizeSearchText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function parkLabel() {
    if (state.parkFilter === "disneyland") {
      return "DL";
    }
    if (state.parkFilter === "dca") {
      return "DCA";
    }
    return "BOTH";
  }

  function fixLabel() {
    if (!state.lastPosition) {
      return "NO FIX";
    }
    var ageSeconds = Math.max(0, Math.round((Date.now() - (state.lastPosition.timestamp || Date.now())) / 1000));
    var accuracy = state.lastPosition.accuracy ? " " + formatFeet(state.lastPosition.accuracy) : "";
    if (ageSeconds < 60) {
      return "FIX " + ageSeconds + "S" + accuracy;
    }
    return "FIX " + Math.round(ageSeconds / 60) + "M" + accuracy;
  }

  function updatedLabel() {
    if (!state.waitData) {
      return state.loading ? "WAIT DATA LOADING" : "NO WAIT DATA";
    }
    var latest = state.waitData.latest_update || state.waitData.generated_at;
    return latest ? "UPDATED " + formatTime(latest) : "UPDATED UNKNOWN";
  }

  function summaryTitle(ride) {
    if (ride.distanceMeters !== null && ride.distanceMeters !== undefined) {
      return formatDistance(ride.distanceMeters) + " TO " + compactName(ride.name);
    }
    if (currentFilter().key === "open" || currentFilter().key === "all") {
      return "LOCATION WAITING";
    }
    return compactName(ride.name) + " " + formatWait(ride);
  }

  function setStatus(value) {
    if (dom.status) {
      dom.status.textContent = value;
    }
  }

  function updateClock() {
    if (!dom.clock) {
      return;
    }
    dom.clock.textContent = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function formatTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "UNKNOWN";
    }
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function compactName(name) {
    return displayName(name)
      .replace(/^Pirate's Lair on Tom Sawyer Island$/i, "Pirate's Lair")
      .replace(/^Frontierland\s+/i, "")
      .replace(/\s+-\s+.*$/, "")
      .replace(/\s+inspired by.*$/i, "")
      .replace(/^Star Wars:\s*/i, "")
      .replace(/^The Many Adventures of\s+/i, "")
      .toUpperCase();
  }

  function displayName(name) {
    var value = String(name || "");
    return value
      .replace(/^Star Wars:\s*Rise of the Resistance$/i, "Rise Resistance")
      .replace(/^Radiator Springs Racers Single Rider$/i, "Racers Single Rider")
      .replace(/^Radiator Springs Racers$/i, "Radiator Racers")
      .replace(/^Guardians of the Galaxy\s+-\s+Mission:\s*BREAKOUT!$/i, "Guardians Mission")
      .replace(/^Indiana Jones.*Adventure$/i, "Indiana Jones")
      .replace(/^Pirate's Lair on Tom Sawyer Island$/i, "Pirate's Lair")
      .replace(/^Frontierland Shootin' Exposition$/i, "Shootin' Exposition")
      .replace(/^Davy Crockett's Explorer Canoes$/i, "Explorer Canoes")
      .replace(/^The Little Mermaid\s+-\s+Ariel's Undersea Adventure$/i, "Little Mermaid")
      .replace(/^WEB SLINGERS:\s*A Spider-Man Adventure Single Rider$/i, "WEB Single Rider")
      .replace(/^WEB SLINGERS:\s*A Spider-Man Adventure$/i, "WEB SLINGERS");
  }

  function formatWait(ride) {
    if (!ride.isOpen) {
      return "CLOSED";
    }
    return String(Math.max(0, Math.round(ride.waitTime))) + "m";
  }

  function distanceAndBearing(ride) {
    if (ride.distanceMeters === null || ride.distanceMeters === undefined) {
      return ride.coordSource === "ride" ? "GPS --" : "GPS ~";
    }
    return formatDistance(ride.distanceMeters) + " " + cardinalFromBearing(ride.bearing);
  }

  function formatDistance(meters) {
    if (meters < 12) {
      return "NEAR";
    }
    if (meters < 193) {
      return formatFeet(meters);
    }
    return (meters * METERS_TO_MILES).toFixed(1) + " MI";
  }

  function formatFeet(meters) {
    var feet = Math.max(25, Math.round((meters * METERS_TO_FEET) / 25) * 25);
    return feet + " FT";
  }

  function haversineMeters(a, b) {
    var radius = 6371000;
    var lat1 = toRadians(a.lat);
    var lat2 = toRadians(b.lat);
    var dLat = toRadians(b.lat - a.lat);
    var dLon = toRadians(b.lon - a.lon);
    var h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function bearingDegrees(a, b) {
    var lat1 = toRadians(a.lat);
    var lat2 = toRadians(b.lat);
    var dLon = toRadians(b.lon - a.lon);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
  }

  function cardinalFromBearing(degrees) {
    if (degrees === null || degrees === undefined) {
      return "--";
    }
    var labels = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return labels[Math.round(degrees / 22.5) % labels.length];
  }

  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  function toDegrees(value) {
    return (value * 180) / Math.PI;
  }

  function readLastPosition() {
    try {
      var raw = localStorage.getItem(POSITION_KEY);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      var age = Date.now() - Number(parsed.timestamp || 0);
      if (typeof parsed.lat === "number" && typeof parsed.lon === "number" && age < 15 * 60 * 1000) {
        return parsed;
      }
    } catch (error) {}
    return null;
  }

  function writeLastPosition(position) {
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch (error) {}
  }

  function readInitialFilter() {
    var saved = localStorage.getItem(FILTER_KEY);
    if (filterIndex(saved) !== 0 || saved === "open") {
      return saved;
    }
    if (localStorage.getItem(OPEN_ONLY_KEY) === "false") {
      return "all";
    }
    return "open";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.RAYBAN_DISNEY_NEARBY = {
    attractionCoordinateCount: Object.keys(ATTRACTION_COORDS).length,
    landCoordinateCount: Object.keys(LAND_COORDS).length,
    haversineMeters: haversineMeters,
    bearingDegrees: bearingDegrees,
    cardinalFromBearing: cardinalFromBearing,
    normalizeWaits: normalizeWaits,
    getVisibleRidesForTest: function (payload, position, options) {
      var previousData = state.waitData;
      var previousRides = state.rides;
      var previousPosition = state.lastPosition;
      var previousPark = state.parkFilter;
      var previousFilter = state.rideFilter;
      state.waitData = payload;
      state.rides = normalizeWaits(payload);
      state.lastPosition = position || null;
      if (options && options.parkFilter) {
        state.parkFilter = options.parkFilter;
      }
      if (options && options.rideFilter) {
        state.rideFilter = options.rideFilter;
      }
      var result = getVisibleRides();
      state.waitData = previousData;
      state.rides = previousRides;
      state.lastPosition = previousPosition;
      state.parkFilter = previousPark;
      state.rideFilter = previousFilter;
      return result;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
