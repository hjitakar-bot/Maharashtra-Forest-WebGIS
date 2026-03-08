startForestAnimation();
// ===============================
// 1️⃣ MAP INIT
// ===============================
var map = L.map('map').setView([18.5, 74.5], 7);

// ===============================
// BASE MAPS (WORKING SATELLITE)
// ===============================

var street = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '© OpenStreetMap contributors' }
).addTo(map);

var street = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '© OpenStreetMap contributors' }
);

var satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles © Esri' }
).addTo(map);   // ✅ Satellite default

var baseMaps = {
  "Street Map": street,
  "Satellite": satellite
};

L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);

var geojsonLayer;
var forestChart; // 🔥 Added for chart

// ===============================
// 🌳 FOREST COVER DATA (%)
// ===============================
var forestTimeSeries = {
  "Ahmadnagar": {2007:1.68, 2015:1.66, 2023:6.2},
  "Akola": {2007:5.97, 2015:5.97, 2023:5.1},
  "Amravati": {2007:26.1, 2015:26.10, 2023:26.0},
  "Aurangabad": {2007:5.51, 2015:5.51, 2023:3.8},
  "Bhandara": {2007:24.83, 2015:24.64, 2023:32.4},
  "Bid": {2007:1.64, 2015:1.64, 2023:2.9},
  "Buldana": {2007:6.1, 2015:6.11, 2023:11.2},
  "Chandrapur": {2007:35.6, 2015:35.59, 2023:35.0},
  "Dhule": {2007:4.47, 2015:4.40, 2023:8.4},
  "Garhchiroli": {2007:70.05, 2015:70.06, 2023:70.0},
  "Gondiya": {2007:35.08, 2015:35.03, 2023:37.1},
  "Hingoli": {2007:2.43, 2015:2.43, 2023:4.5},
  "Jalgaon": {2007:10.07, 2015:10.06, 2023:7.6},
  "Jalna": {2007:0.84, 2015:0.84, 2023:2.7},
  "Kolhapur": {2007:23.1, 2015:23.19, 2023:21.3},
  "Latur": {2007:0.07, 2015:0.07, 2023:3.1},
  "Mumbai City": {2007:1.27, 2015:1.27, 2023:0.8},
  "Mumbai Suburban": {2007:26.91, 2015:27.13, 2023:33.78},
  "Nagpur": {2007:20.45, 2015:20.33, 2023:28.4},
  "Nanded": {2007:8.68, 2015:8.68, 2023:12.7},
  "Nandurbar": {2007:20.37, 2015:20.18, 2023:16.8},
  "Nashik": {2007:7.01, 2015:7.01, 2023:24.5},
  "Osmanabad": {2007:0.57, 2015:0.57, 2023:2.1},
  "Parbhani": {2007:0.79, 2015:0.79, 2023:3.4},
  "Pune": {2007:11.07, 2015:11.08, 2023:18.6},
  "Palghar": {2007:32, 2015:28.1, 2023:32.0},
  "Raigarh": {2007:40.04, 2015:40.20, 2023:41.0},
  "Ratnagiri": {2007:51.16, 2015:51.12, 2023:52.1},
  "Sangli": {2007:1.68, 2015:1.69, 2023:4.3},
  "Satara": {2007:12.18, 2015:12.18, 2023:14.9},
  "Solapur": {2007:0.32, 2015:0.32, 2023:2.6},
  "Sindhudurg": {2007:49.41, 2015:49.49, 2023:53.0},
  "Thane": {2007:30.47, 2015:30.42, 2023:31.25},
  "Wardha": {2007:13.62, 2015:13.62, 2023:9.8},
  "Washim": {2007:6.4, 2015:6.40, 2023:6.5},
  "Yavatmal": {2007:19.18, 2015:19.17, 2023:15.3}
};

var animationYears = [2007, 2015, 2023];
var currentIndex = 0;
var animationInterval;
// ===============================
// TIME SERIES ENGINE
// ===============================

var currentYear = 2023;

function getForestValue(district){

  if(forestTimeSeries[district]){
    return forestTimeSeries[district][currentYear] || 0;
  }

  return 0;
}
// ===============================
// 2️⃣ WFS LOAD
// ===============================
var wfsUrl =
  "http://localhost:8080/geoserver/wfs?" +
  "service=WFS&version=1.0.0&request=GetFeature&" +
  "typeName=harshall_webgis3:Maha_Districts&" +
  "outputFormat=application/json" +
  "&srsName=EPSG:4326";

var districtSelect = document.getElementById("districtSelect");

fetch("maharashtra_districts.geojson")
  .then(response => response.json())
  .then(function(data){

    geojsonLayer = L.geoJSON(data, {

      style: function(feature){

var district = feature.properties.NAME_2;

return{
 fillColor: getForestColor(getForestValue(district)),
 fillOpacity:0.7,
 color:"#333",
 weight:1
};

},

      onEachFeature: function(feature, layer){
		  var districtName = feature.properties.NAME_2;

layer.bindTooltip(districtName, {
permanent: true,
direction: "center",
className: "district-label"
});
      // ===============================
// 📌 POPUP CONTENT
// ===============================

var district = feature.properties.NAME_2;
var forest = parseFloat(getForestValue(district));

// area calculate
var area = turf.area(feature);
var areaSqKm = (area / 1000000).toFixed(2);

// popup HTML design
var popupContent = `
  <div style="
      min-width:200px;
      font-family:Arial;
      font-size:14px;
  ">
    <h3 style="
        margin:5px 0;
        color:#ff6a00;
        border-bottom:1px solid #ddd;
        padding-bottom:5px;
    ">
      ${district}
    </h3>

    <p><b>Area:</b> ${areaSqKm} sq.km</p>
    <p><b>Forest Cover:</b> ${forest} %</p>
  </div>
`;

layer.bindPopup(popupContent);
        var option = document.createElement("option");
        option.value = feature.properties.NAME_2;
        option.text = feature.properties.NAME_2;
        districtSelect.appendChild(option);
        var c1 = document.createElement("option");
c1.value = feature.properties.NAME_2;
c1.text = feature.properties.NAME_2;
document.getElementById("compare1").appendChild(c1);

var c2 = document.createElement("option");
c2.value = feature.properties.NAME_2;
c2.text = feature.properties.NAME_2;
document.getElementById("compare2").appendChild(c2);
        layer.on("click", function(){
          showDistrictInfo(feature, layer);
        });
 // ===============================
  // 🟢 HOVER HIGHLIGHT (NEW)
  // ===============================

  layer.on("mouseover", function(e){

    var layer = e.target;

    layer.setStyle({
      weight: 3,
      color: "#ff0000",
      fillOpacity: 0.9
    });

    layer.bringToFront();
  });

  layer.on("mouseout", function(e){

    
    geojsonLayer.resetStyle(e.target);

  });

}

    }).addTo(map);
calculateForestChangeStats();
});

// ===============================
// 🎨 FOREST COLOR SCALE
// ===============================
function getForestColor(value){

  if(value > 60) return "#00441b";
  else if(value > 40) return "#238b45";
  else if(value > 25) return "#66c2a4";
  else if(value > 15) return "#b2e2e2";
  else if(value > 5) return "#edf8b1";
  else return "#e31a1c";

}
function getForestChangeColor(district){

var forest2007 = forestTimeSeries[district][2007];
var forest2023 = forestTimeSeries[district][2023];

var diff = forest2023 - forest2007;

if(diff > 2){
   return "#2ecc71"; // forest increase
}
else if(diff < -2){
   return "#e74c3c"; // forest decrease
}
else{
   return "#bdc3c7"; // stable
}

}
// ===============================
// 3️⃣ HIGHLIGHT
// ===============================
function highlightFeature(layer){

 if(!geojsonLayer) return;

 // Reset all districts
 geojsonLayer.eachLayer(function(l){
    var district = l.feature.properties.NAME_2;
    var forest = parseFloat(getForestValue(district));

    l.setStyle({
       fillColor: getForestColor(forest),
       fillOpacity: 0.7,
       color: "#333",
       weight: 1
    });
 });

 // Highlight selected district
 var district = layer.feature.properties.NAME_2;
 var forest = parseFloat(getForestValue(district));

 layer.setStyle({
    fillColor: getForestColor(forest),
    fillOpacity: 0.9,
    color: "#000",
    weight: 3
 });

}

// ===============================
// ✅ showDistrictInfo (Chart Added)
// ===============================
function showDistrictInfo(feature, layer){

  highlightFeature(layer);

  var infoBox = document.querySelector(".sidebar");
  infoBox.classList.remove("active-district");
  void infoBox.offsetWidth;
  infoBox.classList.add("active-district");

  document.getElementById("districtName").innerHTML =
    feature.properties.NAME_2;
  document.getElementById("districtSelect").value =
  feature.properties.NAME_2;
var forest = getForestValue(feature.properties.NAME_2);

document.getElementById("forestValue").innerHTML =
  forest + " %";
	// ===============================
// 🤖 GEOAI ENGINE
// ===============================

var value = getForestValue(feature.properties.NAME_2);

// Risk Score
var riskScore = (100 - value).toFixed(2);
var riskLevel = "";

if (riskScore > 80) riskLevel = "Critical";
else if (riskScore > 60) riskLevel = "High Risk";
else if (riskScore > 40) riskLevel = "Moderate Risk";
else if (riskScore > 20) riskLevel = "Low Risk";
else riskLevel = "Very Safe";

// Vulnerability Index
var vulnerability = (riskScore * 0.7).toFixed(2);

// Set values
document.getElementById("riskScore").innerHTML = riskScore;
document.getElementById("riskLevel").innerHTML = riskLevel;
document.getElementById("vulnerabilityIndex").innerHTML = vulnerability;
// ===============================
// 🤖 ML ENGINE
// ===============================

// Calculate state average
var total = 0;

for (var d in forestTimeSeries) {

  total += getForestValue(d);

}

var stateAvg = total / Object.keys(forestTimeSeries).length;

// Trend logic
var trend = (value - stateAvg) / 5;
var predicted = (value + trend).toFixed(2);

// Trend label
var trendLabel = trend > 0 ? "Growing 🌱" :
                 trend < 0 ? "Declining 🔻" :
                 "Stable ⚖️";

// Fake ML confidence (based on stability)
var confidence = Math.abs(trend) < 1 ? "High" :
                 Math.abs(trend) < 3 ? "Medium" :
                 "Low";

// Set values
document.getElementById("mlPrediction").innerHTML =
  predicted + " %";

document.getElementById("mlTrend").innerHTML =
  trendLabel;

document.getElementById("mlConfidence").innerHTML =
  confidence;
  calculateDistrictRank(feature.properties.NAME_2);
  document.getElementById("districtID").innerHTML =
    feature.id;

  document.getElementById("geomType").innerHTML =
    feature.geometry.type;

  var area = turf.area(feature);
  var areaSqKm = area / 1000000;

  document.getElementById("areaValue").innerHTML =
    areaSqKm.toFixed(2);

  map.fitBounds(layer.getBounds());
  

  // ===============================
  // 📊 FOREST CHART UPDATE
  // ===============================

  var forestValue = getForestValue(feature.properties.NAME_2);

  if (forestChart) {
    forestChart.destroy();
  }

  var ctx = document.getElementById("forestChart").getContext("2d");

  forestChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Forest %"],
      datasets: [{
        label: feature.properties.NAME_2,
        data: [forestValue],
        backgroundColor: "rgba(76, 175, 80, 0.7)",
        borderColor: "rgba(27, 94, 32, 1)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// ===============================
// 4️⃣ RESET VIEW
// ===============================
function resetView(){

  if(!geojsonLayer) return;

  geojsonLayer.resetStyle();
  map.setView([18.5, 74.5], 7);

  document.getElementById("districtName").innerHTML = "None";
  document.getElementById("districtID").innerHTML = "-";
  document.getElementById("geomType").innerHTML = "-";
  document.getElementById("areaValue").innerHTML = "-";
  document.getElementById("forestValue").innerHTML = "-";
  document.getElementById("districtRank").innerHTML = "-";
document.getElementById("districtCategory").innerHTML = "-";

  if (forestChart) {
    forestChart.destroy();
  }
}

// ===============================
// DROPDOWN CHANGE EVENT
// ===============================
districtSelect.addEventListener("change", function(){

  var selectedDistrict = this.value;

  geojsonLayer.eachLayer(function(layer){

    if(layer.feature.properties.NAME_2 === selectedDistrict){
      showDistrictInfo(layer.feature, layer);
    }

  });

});

// ===============================
// 🌳 FOREST % LEGEND (LOW → HIGH)
// ===============================
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

var div = L.DomUtil.create('div', 'info legend');

div.innerHTML += "<b>Forest Cover (%)</b><br>";

var grades = [
{color:"#e31a1c", label:"0–5%"},
{color:"#edf8b1", label:"5–15%"},
{color:"#b2e2e2", label:"15–25%"},
{color:"#66c2a4", label:"25–40%"},
{color:"#238b45", label:"40–60%"},
{color:"#00441b", label:"60%+"}
];

grades.forEach(function(g){

div.innerHTML +=
'<i style="background:'+g.color+'"></i> '+
g.label + '<br>';

});

return div;

};

legend.addTo(map);
// ===============================
// DRAW TOOL
// ===============================

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polygon: true,
    rectangle: true,
    circle: true,
    marker: true,
    polyline: true
  }
});

map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);
});

function toggleMode() {
  document.body.classList.toggle("dark-mode");
}

// ===============================
// 🏆 RANK SYSTEM
// ===============================

function calculateDistrictRank(selectedDistrict) {

  // Convert object to array and sort descending
 var sorted = Object.entries(forestTimeSeries)
.map(function(item){
  return [item[0], getForestValue(item[0])];
});

  var rank = 0;
  var total = sorted.length;

  for (var i = 0; i < sorted.length; i++) {
    if (sorted[i][0] === selectedDistrict) {
      rank = i + 1;
      break;
    }
  }

  document.getElementById("districtRank").innerHTML =
    "" + rank + " out of " + total;

  // Category detection
  var value = getForestValue(selectedDistrict);
  var category = "";

  if (value > 50) category = "Very High";
  else if (value > 30) category = "High";
  else if (value > 15) category = "Moderate";
  else if (value > 5) category = "Low";
  else category = "Very Low";

  document.getElementById("districtCategory").innerHTML =
    category;
}

// ===============================
// 📑 EXPORT PDF REPORT
// ===============================
async function downloadReport() {

  if (document.getElementById("districtName").innerHTML === "None") {
    alert("Please select a district first.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  var name = document.getElementById("districtName").innerHTML;
  var area = document.getElementById("areaValue").innerHTML;
  var forest = document.getElementById("forestValue").innerHTML;
  var rank = document.getElementById("districtRank").innerHTML;
  var category = document.getElementById("districtCategory").innerHTML;

  // Title
  doc.setFontSize(18);
  doc.text("Maharashtra Forest Report", 20, 20);

  doc.setFontSize(12);
  doc.text("District: " + name, 20, 40);
  doc.text("Area (sq.km): " + area, 20, 50);
  doc.text("Forest Cover: " + forest, 20, 60);
  doc.text("Rank: " + rank, 20, 70);
  doc.text("Category: " + category, 20, 80);

  // Add Chart Image
  var canvas = document.getElementById("forestChart");
  var chartImage = canvas.toDataURL("image/png", 1.0);

  doc.addImage(chartImage, "PNG", 20, 100, 160, 80);

  doc.save(name + "_Forest_Report.pdf");
}
// ===============================
// 🌳 DAY 61 - FOREST RANGE FILTER
// ===============================

function applyForestFilter() {

  var min = parseFloat(document.getElementById("minForest").value);
  var max = parseFloat(document.getElementById("maxForest").value);

  if (!geojsonLayer) return;

  geojsonLayer.eachLayer(function(layer) {

    var district = layer.feature.properties.NAME_2;
    var forest = parseFloat(getForestValue(district));

    if (forest >= min && forest <= max) {

      layer.setStyle({
        fillColor: getForestColor(forest),
        fillOpacity: 0.8,
        weight: 2
      });

    } else {

      layer.setStyle({
        fillOpacity: 0.1,
        color: "#ccc"
      });

    }

  });

}
function resetForestFilter() {

  document.getElementById("minForest").value = 0;
  document.getElementById("maxForest").value = 100;

  geojsonLayer.resetStyle();

}
// ===============================
// 🏆 DAY 61 - LEADERBOARD SYSTEM
// ===============================

function generateLeaderboard() {

  var sorted = Object.entries(forestTimeSeries)
.map(function(item){
  return [item[0], getForestValue(item[0])];
})
.sort(function(a,b){
  return b[1] - a[1];
});

  var top5 = sorted.slice(0, 5);
  var bottom5 = sorted.slice(-5).reverse();

  var topList = document.getElementById("topDistricts");
  var bottomList = document.getElementById("bottomDistricts");

  topList.innerHTML = "";
  bottomList.innerHTML = "";

  top5.forEach(function(item){

    var li = document.createElement("li");
    li.innerHTML = item[0] + " - " + item[1] + "%";
    li.onclick = function() {
      zoomToDistrict(item[0]);
    };

    topList.appendChild(li);
  });

  bottom5.forEach(function(item){

    var li = document.createElement("li");
    li.innerHTML = item[0] + " - " + item[1] + "%";
    li.onclick = function() {
      zoomToDistrict(item[0]);
    };

    bottomList.appendChild(li);
  });

}

// Click from leaderboard → Zoom map
function zoomToDistrict(districtName){

  geojsonLayer.eachLayer(function(layer){

    if(layer.feature.properties.NAME_2 === districtName){
      showDistrictInfo(layer.feature, layer);
    }

  });

}

// Call once on load
generateLeaderboard();
// ===============================
// 🔍 DAY 61 - ADVANCED QUERY BUILDER
// ===============================

function getCategory(value){

  if (value > 50) return "Very High";
  if (value > 30) return "High";
  if (value > 15) return "Moderate";
  if (value > 5) return "Low";
  return "Very Low";
}

function applyAdvancedQuery(){

  var type = document.getElementById("queryType").value;
  var min = parseFloat(document.getElementById("queryMin").value);
  var max = parseFloat(document.getElementById("queryMax").value);
  var category = document.getElementById("queryCategory").value;
  var resultCount = 0;
  var totalForest = 0;
  var selectedLayers = [];
  geojsonLayer.eachLayer(function(layer){
	  var avg = resultCount > 0 
  ? (totalForest / resultCount).toFixed(2)
  : 0;

document.getElementById("queryCount").innerHTML = resultCount;
document.getElementById("queryAvg").innerHTML = avg + " %";

    var district = layer.feature.properties.NAME_2;
    var forest = parseFloat(getForestValue(district));
    var show = false;

    if (type === "greater" && forest > min) show = true;

    if (type === "less" && forest < min) show = true;

    if (type === "between" && forest >= min && forest <= max) show = true;

    if (type === "category" && getCategory(forest) === category) show = true;

   if (show) {

  var categoryType = getCategory(forest);
  var color;

  if (categoryType === "Very High") color = "#00441b";
  else if (categoryType === "High") color = "#238b45";
  else if (categoryType === "Moderate") color = "#66c2a4";
  else if (categoryType === "Low") color = "#ff9800";
  else color = "#e53935"; // Very Low
  resultCount++;
totalForest += forest;
  layer.setStyle({
    fillColor: color,
    fillOpacity: 0.9,
    color: "#000",
    weight: 2
  });

} else {

  layer.setStyle({
    fillOpacity: 0.1,
    color: "#ccc"
  });

}

  });

}

function resetAdvancedQuery(){

  geojsonLayer.resetStyle();

  document.getElementById("queryMin").value = "";
  document.getElementById("queryMax").value = "";
  document.getElementById("queryCategory").value = "";

}
var compareChart;

function compareDistricts(){

  var d1 = document.getElementById("compare1").value;
  var d2 = document.getElementById("compare2").value;

  if (!d1 || !d2) {
    alert("Select both districts");
    return;
  }

var v1 = getForestValue(d1);
var v2 = getForestValue(d2);

  var diff = Math.abs(v1 - v2).toFixed(2);

  document.getElementById("compareDiff").innerHTML =
    diff + " %";

  if (compareChart) compareChart.destroy();

  var ctx = document.getElementById("compareChart").getContext("2d");

  compareChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [d1, d2],
      datasets: [{
        label: "Forest %",
        data: [v1, v2],
        backgroundColor: [
          "rgba(34,139,34,0.8)",
          "rgba(160,82,45,0.8)"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

}


// ===============================
// 🤖 STATE AI OVERVIEW
// ===============================

function stateAIOverview(){

  var total = 0;
  var hotspotCount = 0;

  for (var district in forestTimeSeries){

    var value = getForestValue(district);

    total += value;

    if (value < 10){
      hotspotCount++;
    }

  }

  var avg = (total / Object.keys(forestTimeSeries).length).toFixed(2);

  document.getElementById("stateAvg").innerHTML = avg + "%";
  document.getElementById("hotspotCount").innerHTML = hotspotCount;

}

stateAIOverview();
function toggleSidebar(){
  document.querySelector(".sidebar").classList.toggle("show");
}
map.on("click", function(){
  document.querySelector(".sidebar").classList.remove("show");
});
// ===============================
// YEAR SLIDER CONTROL
// ===============================

var slider = document.getElementById("yearSlider");
var yearLabel = document.getElementById("selectedYear");

slider.oninput = function(){

  currentYear = parseInt(this.value);

  yearLabel.innerHTML = currentYear;

  updateForestMap();        // map color update
  updateSelectedDistrict(); // sidebar forest value update
  updateChart();            // chart update

};

function updateForestMap(){

  if(!geojsonLayer) return;

  geojsonLayer.eachLayer(function(layer){

    var district = layer.feature.properties.NAME_2;
    var forest = parseFloat(getForestValue(district));

    // Map color update
    layer.setStyle({
      fillColor: getForestColor(forest),
      fillOpacity: 0.7,
      color: "#333",
      weight: 1
    });

    // ⭐ Popup update
    var area = turf.area(layer.feature);
    var areaSqKm = (area / 1000000).toFixed(2);

    var popupContent = `
      <div style="min-width:200px;font-family:Arial;font-size:14px;">
        <h3 style="margin:5px 0;color:#ff6a00;border-bottom:1px solid #ddd;padding-bottom:5px;">
          ${district}
        </h3>
        <p><b>Area:</b> ${areaSqKm} sq.km</p>
        <p><b>Forest Cover:</b> ${forest} %</p>
      </div>
    `;

    layer.bindPopup(popupContent);

    // Sidebar update
    var selected = document.getElementById("districtName").innerHTML;

    if(selected === district){
      document.getElementById("forestValue").innerHTML =
        forest + " %";
    }

  });

}
function updateSelectedDistrict(){

  var district = document.getElementById("districtName").innerHTML;

  if(district && district !== "None"){

    var forest = parseFloat(getForestValue(district));

    document.getElementById("forestValue").innerHTML =
      forest + " %";

  }

}
function updateChart(){

  var district = document.getElementById("districtName").innerHTML;

  if(!district) return;

  var forest = parseFloat(getForestValue(district));

  forestChart.data.datasets[0].data = [forest];

  forestChart.update();

}
document.getElementById("districtSelect").addEventListener("change", function(){

    var selectedDistrict = this.value;

    geojsonLayer.eachLayer(function(layer){

        var district = layer.feature.properties.NAME_2;

        if(district === selectedDistrict){

            // Zoom to district
            map.fitBounds(layer.getBounds());

            // Highlight district
            highlightFeature(layer);

            // Open correct popup
            layer.openPopup();

        }

    });

});
function startForestAnimation(){

 if(animationInterval) return; // already running stop duplicate

 animationInterval = setInterval(function(){

   currentIndex++;

   if(currentIndex >= animationYears.length){
      currentIndex = 0;
   }

   currentYear = animationYears[currentIndex];

   document.getElementById("selectedYear").innerHTML = currentYear;

   updateForestMap();

 },3000);

}
function pauseForestAnimation(){

 clearInterval(animationInterval);

 animationInterval = null;

}
function calculateForestChangeStats(){

var increase = 0;
var decrease = 0;
var stable = 0;

for(var district in forestTimeSeries){

var diff = forestTimeSeries[district][2023] - forestTimeSeries[district][2007];

if(diff > 2){
increase++;
}
else if(diff < -2){
decrease++;
}
else{
stable++;
}

}

document.getElementById("changeStats").innerHTML =
"Total Districts: " + (increase+decrease+stable) + "<br>" +
"Forest Increase: " + increase + "<br>" +
"Forest Decrease: " + decrease + "<br>" +
"Stable: " + stable;

}
function showForestLossHotspots(){

for(var district in forestTimeSeries){

var diff = forestTimeSeries[district][2023] - forestTimeSeries[district][2007];

if(diff < -2){

geojsonLayer.eachLayer(function(layer){

if(layer.feature.properties.NAME_2 === district){

var center = layer.getBounds().getCenter();

L.circleMarker(center,{
radius:8,
color:"#ff0000",
fillColor:"#ff0000",
fillOpacity:0.8
}).addTo(map)
.bindPopup("Forest Loss Hotspot<br>"+district);

}

});

}

}

}
function showDeforestationAlerts(){

for(var district in forestTimeSeries){

var diff = forestTimeSeries[district][2023] - forestTimeSeries[district][2007];

if(diff < -3){   // heavy forest loss

geojsonLayer.eachLayer(function(layer){

if(layer.feature.properties.NAME_2 === district){

var center = layer.getBounds().getCenter();

var alert = L.circleMarker(center,{
radius:12,
color:"#ff0000",
fillColor:"#ff0000",
fillOpacity:0.7
}).addTo(map);

alert.bindPopup("🚨 Deforestation Alert<br>"+district);

blinkAlert(alert);

}

});

}

}

}
function blinkAlert(marker){

var visible = true;

setInterval(function(){

if(visible){
marker.setStyle({fillOpacity:0.1});
}
else{
marker.setStyle({fillOpacity:0.9});
}

visible = !visible;

},800);

}
function getForestRisk(district){

var forest2007 = forestTimeSeries[district][2007];
var forest2023 = forestTimeSeries[district][2023];

var diff = forest2023 - forest2007;

if(diff < -3){
   return "HIGH";
}
else if(diff < -1){
   return "MEDIUM";
}
else{
   return "LOW";
}

}
function getRiskColor(risk){

if(risk === "HIGH"){
   return "#e74c3c";   // red
}
else if(risk === "MEDIUM"){
   return "#f39c12";   // orange
}
else{
   return "#2ecc71";   // green
}

}

