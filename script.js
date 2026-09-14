(function(){

  /* ---------- location gate ---------- */
  var gate = document.getElementById('gate');
  function openGangtok(msg){
    gate.classList.add('hidden');
    if(msg){
      var banner = document.getElementById('bannerText');
      banner.textContent = msg;
    }
    initMap();
    fetchWeather();
  }
  document.getElementById('continueGangtok').addEventListener('click', function(){ openGangtok(); });
  document.querySelector('#gateList li.enabled').addEventListener('click', function(){ openGangtok(); });
  document.querySelector('#gateList li.enabled').addEventListener('keypress', function(e){ if(e.key==='Enter') openGangtok(); });
  document.getElementById('useLocationBtn').addEventListener('click', function(){
    var fallback = "Your device location is outside the current pilot area. Showing Gangtok, Sikkim — the only location supported in this demonstration.";
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        function(){ openGangtok(fallback); },
        function(){ openGangtok(fallback); },
        { timeout: 3000 }
      );
    } else {
      openGangtok(fallback);
    }
  });
  document.getElementById('changeLocationBtn').addEventListener('click', function(){
    gate.classList.remove('hidden');
  });

  /* ---------- language toggle ---------- */
  var dict = {
    nav_home:{en:"Home", ne:"गृहपृष्ठ", hi:"होम"},
    nav_map:{en:"Risk dashboard", ne:"जोखिम ड्यासबोर्ड", hi:"जोखिम डैशबोर्ड"},
    nav_report:{en:"Field reports", ne:"क्षेत्र प्रतिवेदन", hi:"क्षेत्र रिपोर्ट"},
    nav_alerts:{en:"Alerts", ne:"सूचना", hi:"चेतावनी"},
    nav_about:{en:"About", ne:"बारेमा", hi:"परिचय"},
    site_tagline:{en:"Early warning and monitoring for landslide-prone slopes", ne:"पहिरो जोखिमयुक्त भिरालो क्षेत्रको पूर्व सूचना र अनुगमन", hi:"भूस्खलन-प्रवण ढलानों हेतु पूर्व चेतावनी और निगरानी"},
    alert_heading:{en:"Current status", ne:"हालको अवस्था", hi:"वर्तमान स्थिति"},
    map_heading:{en:"Gangtok — population and landslide risk zones", ne:"ग्याङटक — जनसंख्या र पहिरो जोखिम क्षेत्र", hi:"गंगटोक — जनसंख्या और भूस्खलन जोखिम क्षेत्र"},
    conditions_heading:{en:"Present conditions — Gangtok", ne:"हालको अवस्था — ग्याङटक", hi:"वर्तमान स्थिति — गंगटोक"},
    forecast_heading:{en:"Three-day rainfall outlook", ne:"तीन दिनको वर्षा पूर्वानुमान", hi:"तीन-दिवसीय वर्षा पूर्वानुमान"},
    roads_heading:{en:"Road connectivity", ne:"सडक जडान स्थिति", hi:"सड़क संपर्क स्थिति"},
    priority_heading:{en:"Response priority order", ne:"प्राथमिकता क्रम", hi:"प्राथमिकता क्रम"},
    report_heading:{en:"Report a slope or road hazard", ne:"जोखिम विवरण पेश गर्नुहोस्", hi:"खतरे की रिपोर्ट करें"},
    about_heading:{en:"About this platform", ne:"यस प्लेटफर्मको बारेमा", hi:"इस मंच के बारे में"}
  };
  document.querySelectorAll('.lang-toggle button').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.lang-toggle button').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var lang = btn.getAttribute('data-lang');
      document.getElementById('htmlRoot').setAttribute('lang', lang);
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var key = el.getAttribute('data-i18n');
        if(dict[key] && dict[key][lang]) el.textContent = dict[key][lang];
      });
    });
  });

  /* ---------- map ---------- */
  var mapInitialised = false;
  function initMap(){
    if(mapInitialised) return;
    mapInitialised = true;

    var map = L.map('map').setView([27.3320, 88.6120], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var populationAreas = [
      {name:"Lower MG Marg (Ward 8)", lat:27.3299, lng:88.6138, level:"Very high", radius:14, desc:"Main commercial street and civic offices; the busiest part of town through the day."},
      {name:"Deorali (Ward 11)", lat:27.3193, lng:88.6087, level:"High", radius:11, desc:"Dense residential and market cluster on the southern approach to town."},
      {name:"Tadong (Ward 13)", lat:27.3040, lng:88.6122, level:"High", radius:11, desc:"Institutional and residential area near the university and NIT campuses."},
      {name:"Ranipool (Ward 14)", lat:27.2865, lng:88.6198, level:"High", radius:11, desc:"Growing settlement along the Gangtok–Rangpo corridor."},
      {name:"Chandmari (Ward 4)", lat:27.3396, lng:88.6202, level:"High", radius:11, desc:"Long-settled residential ward on the eastern hillside."},
      {name:"Development Area (Ward 5)", lat:27.3262, lng:88.6052, level:"Moderate", radius:8, desc:"Planned institutional and residential layout."},
      {name:"Tibet Road / Arithang", lat:27.3332, lng:88.6165, level:"Moderate", radius:8, desc:"Mixed residential and commercial lanes close to the ridge."}
    ];

    var riskZones = [
      {name:"Burtuk", lat:27.3536, lng:88.6041, level:"Very High", reason:"Steep northwestern slope with a long record of shallow slides; ranked among the town's most vulnerable wards in hazard studies."},
      {name:"Upper Sichey", lat:27.3452, lng:88.5978, level:"Very High", reason:"Fractured hillside above the town with repeated creep and ground subsidence."},
      {name:"Syari–Tathangchen", lat:27.3572, lng:88.6122, level:"High", reason:"East-facing slope below the old Palace grounds; a slow-moving landslide has been active here for decades."},
      {name:"Chandmari slide belt", lat:27.3410, lng:88.6215, level:"High", reason:"Slope has failed repeatedly since the 1960s, with cracked buildings and road subsidence recorded nearby."},
      {name:"Ranipool corridor", lat:27.2865, lng:88.6198, level:"High", reason:"Loose fill slopes along the highway, sensitive to prolonged rainfall."},
      {name:"Tadong cut slopes", lat:27.3040, lng:88.6122, level:"Moderate", reason:"Shallow slides reported on cut slopes along institutional access roads."}
    ];

    var roads = [
      {name:"NH10, Ranipool – Gangtok", color:"#a66a1e", points:[[27.2840,88.6210],[27.3040,88.6122],[27.3193,88.6087],[27.3299,88.6138]], status:"Reduced — single lane near Ranipool"},
      {name:"Gangtok – Ranka road", color:"#2f4f3e", points:[[27.3299,88.6138],[27.3396,88.6202],[27.3572,88.6122]], status:"Open"}
    ];

    populationAreas.forEach(function(a){
      var m = L.circleMarker([a.lat,a.lng], {
        radius:a.radius, color:"#1b2a4a", weight:1.5, fillColor:"#1b2a4a", fillOpacity:0.28
      }).addTo(map);
      m.bindPopup("<strong>"+a.name+"</strong><br>Population density: "+a.level+"<br>"+a.desc);
    });

    var riskColor = {"Very High":"#7a1f1f", "High":"#b23a22", "Moderate":"#a66a1e"};
    riskZones.forEach(function(z){
      var m = L.circleMarker([z.lat,z.lng], {
        radius: z.level==="Very High" ? 13 : (z.level==="High" ? 10 : 8),
        color:"#3a2c1c", weight:1, fillColor:riskColor[z.level], fillOpacity:0.75
      }).addTo(map);
      m.bindPopup("<strong>"+z.name+"</strong><br>Risk level: "+z.level+"<br>"+z.reason);
      m.bindTooltip(z.name+" — "+z.level, {permanent:true, direction:"right", offset:[8,0], className:"risk-tooltip"});
    });

    roads.forEach(function(r){
      var line = L.polyline(r.points, {color:r.color, weight:4, opacity:0.8, dashArray: r.status.indexOf("Open")===0 ? null : "6,4"}).addTo(map);
      line.bindPopup("<strong>"+r.name+"</strong><br>Status: "+r.status);
    });
  }

  /* ---------- weather / soil moisture ---------- */
  var GANGTOK_LAT = 27.3389, GANGTOK_LNG = 88.6065;
  var WX_URL = "https://api.open-meteo.com/v1/forecast?latitude="+GANGTOK_LAT+"&longitude="+GANGTOK_LNG+
    "&current=precipitation,rain,temperature_2m,relative_humidity_2m&hourly=precipitation,precipitation_probability,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm&daily=precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=3";

  function classify(rain24, soil13){
    if(rain24 >= 40 || soil13 >= 0.38) return "Very High";
    if(rain24 >= 20 || soil13 >= 0.30) return "High";
    if(rain24 >= 8  || soil13 >= 0.22) return "Moderate";
    return "Low";
  }

  function bannerCopy(level, rain24){
    if(level === "Very High") return "Heavy rainfall and saturated soil around Gangtok. Field teams should treat Burtuk, Upper Sichey and Syari–Tathangchen as priority checks.";
    if(level === "High") return "Rainfall and soil moisture are elevated. Increased vigilance advised in the marked high-risk wards.";
    if(level === "Moderate") return "Conditions are within a normal monsoon range, with some rain expected over the next day.";
    return "No significant rainfall or soil-moisture trigger detected for Gangtok at present.";
  }

  function fetchWeather(){
    var lastUpdatedEl = document.getElementById('lastUpdated');
    lastUpdatedEl.textContent = "Last updated: refreshing…";
    fetch(WX_URL).then(function(res){
      if(!res.ok) throw new Error("weather service unavailable");
      return res.json();
    }).then(function(data){
      var hourlyTimes = data.hourly.time;
      var idx = hourlyTimes.indexOf(data.current.time);
      if(idx < 0) idx = 0;

      var rainNow = data.current.precipitation;
      var soil01 = data.hourly.soil_moisture_0_to_1cm[idx];
      var soil13 = data.hourly.soil_moisture_1_to_3cm[idx];
      var temp = data.current.temperature_2m;

      var rain24 = 0;
      var end = Math.min(idx+24, data.hourly.precipitation.length);
      for(var i=idx; i<end; i++){ rain24 += (data.hourly.precipitation[i]||0); }

      document.getElementById('statRainNow').textContent = rainNow.toFixed(1)+" mm";
      document.getElementById('statRain24').textContent = rain24.toFixed(1)+" mm";
      document.getElementById('statSoil01').textContent = (soil01*100).toFixed(1)+"% by volume";
      document.getElementById('statSoil13').textContent = (soil13*100).toFixed(1)+"% by volume";
      document.getElementById('statTemp').textContent = temp.toFixed(1)+" °C";

      var level = classify(rain24, soil13);
      var badgeClass = level.replace(" ", "-");
      document.getElementById('statRiskBadge').innerHTML = '<span class="badge '+badgeClass+'">'+level+'</span>';

      var banner = document.getElementById('statusBanner');
      banner.className = "banner risk-"+badgeClass;
      document.getElementById('bannerText').textContent = bannerCopy(level, rain24);

      var alertsBody = document.getElementById('alertsBody');
      if(level === "Low"){
        alertsBody.innerHTML = "<p>No active alerts issued for Gangtok at this time.</p>";
      } else {
        alertsBody.innerHTML = "<p><span class='badge "+badgeClass+"'>"+level+"</span> — indicative alert based on current rainfall and soil-moisture readings. This would trigger SMS and app notifications to district authorities and residents of the marked wards in a full deployment.</p>";
      }

      var now = new Date();
      lastUpdatedEl.textContent = "Last updated: "+now.toLocaleTimeString();

      var body = document.getElementById('forecastBody');
      body.innerHTML = "";
      data.daily.time.forEach(function(d, i){
        var sum = data.daily.precipitation_sum[i];
        var prob = data.daily.precipitation_probability_max[i];
        var lvl = classify(sum, soil13);
        var row = document.createElement('tr');
        row.innerHTML = "<td>"+d+"</td><td>"+sum.toFixed(1)+" mm</td><td>"+prob+"%</td><td><span class='badge "+lvl.replace(' ','-')+"'>"+lvl+"</span></td>";
        body.appendChild(row);
      });

    }).catch(function(err){
      document.getElementById('bannerText').textContent = "Live weather data is temporarily unavailable. Showing last known layout only.";
      lastUpdatedEl.textContent = "Last updated: unavailable";
    });
  }

  document.getElementById('refreshBtn').addEventListener('click', fetchWeather);
  setInterval(fetchWeather, 10 * 60 * 1000);

  /* ---------- network status ---------- */
  function updateNet(){
    var el = document.getElementById('netStatus');
    el.textContent = navigator.onLine ? "Online" : "Offline — queuing locally";
  }
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();

  /* ---------- field reports & native local storage ---------- */
  var memoryReports = [];

  function renderReport(container, r){
    var div = document.createElement('div');
    div.className = 'rep';
    var content = "<strong>"+r.locality+"</strong> — "+r.desc;
    
    if(r.imgData) {
      content += "<br><img src='"+r.imgData+"' alt='Hazard photo upload'>";
    } else if(r.file) {
      content += " <em>(Attached: "+r.file+")</em>";
    }
    
    content += "<div class='meta'>"+r.time+(r.geo ? " · location attached" : "")+"</div>";
    div.innerHTML = content;
    container.prepend(div);
  }

  function loadReports(){
    var list = document.getElementById('reportList');
    list.innerHTML = "";
    try {
      var saved = localStorage.getItem('pahiro_reports');
      if(saved) {
        var parsed = JSON.parse(saved);
        parsed.slice().reverse().forEach(function(r){ renderReport(list, r); });
        return;
      }
    } catch(e) {
      console.warn("Local storage unavailable in this iframe environment.");
    }
    
    memoryReports.slice().reverse().forEach(function(r){ renderReport(list, r); });
  }

  document.getElementById('reportForm').addEventListener('submit', function(e){
    e.preventDefault();
    var locality = document.getElementById('repLocality').value;
    var desc = document.getElementById('repDesc').value.trim() || "No description provided.";
    var fileInput = document.getElementById('repFile');
    var fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : null;
    var geo = document.getElementById('repGeo').checked;
    
    var record = { locality:locality, desc:desc, file:fileName, geo:geo, time:new Date().toLocaleString() };

    function finish(rec) {
      try {
        var saved = localStorage.getItem('pahiro_reports');
        var reports = saved ? JSON.parse(saved) : [];
        reports.push(rec);
        localStorage.setItem('pahiro_reports', JSON.stringify(reports));
      } catch(err) {
        memoryReports.push(rec);
      }
      document.getElementById('reportForm').reset();
      loadReports();
    }

    if (fileInput.files && fileInput.files[0]) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        record.imgData = evt.target.result;
        finish(record);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      finish(record);
    }
  });

  loadReports();

})();
