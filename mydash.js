var blessed = require('blessed'),
    contrib = require('blessed-contrib'),
    fs = require('fs');

var screen = blessed.screen();

var serverStatus = [];
//create layout and widgets
var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

var gauge0 = grid.set(0, 0, 2, 3, contrib.gauge, {label: 'L1:S1', percent: [80,20]});
var gauge1 = grid.set(0, 3, 2, 3, contrib.gauge, {label: 'L1:S2', percent: [80,20]});
var gauge2 = grid.set(0, 6, 2, 3, contrib.gauge, {label: 'L2:S1', percent: [80,20]});
var gauge3 = grid.set(0, 9, 2, 3, contrib.gauge, {label: 'L2:S2', percent: [80,20]});
var gauge4 = grid.set(2, 0, 2, 3, contrib.gauge, {label: 'L3:S1', percent: [80,20]});
var gauge5 = grid.set(2, 3, 2, 3, contrib.gauge, {label: 'L3:S2', percent: [80,20]});
//var gauge6 = grid.set(2, 6, 2, 3, contrib.gauge, {label: 'L4:S1', percent: [80,20]});
//var gauge7 = grid.set(2, 9, 2, 3, contrib.gauge, {label: 'L4:S2', percent: [60,20,20]});

//set dummy data on gauge
//var gauge_percent = 0
//setInterval(function() {
//  gauge.setData([gauge_percent, 100-gauge_percent]);
//  gauge_percent++;
//  if (gauge_percent>=100) gauge_percent = 0  
//}, 200)



var map = grid.set(4, 0, 8, 8, contrib.map, {label: 'Servers Location'})
//set map dummy markers
var marker = true;
setInterval(function() {
   if (marker) {
    map.addMarker({"lat" : "52.310539", "lon" : "4.768274", color: 'yellow', char: '1' });
    map.addMarker({"lat" : "52.310539", "lon" : "11", color: 'yellow', char: '2' });
    map.addMarker({"lat" : "38.953116", "lon" : "-77.456539", color: 'cyan', char: '1' });
    map.addMarker({"lat" : "38.953116", "lon" : "-72.456539", color: 'cyan', char: '2' });
    map.addMarker({"lat" : "-33.868820","lon" : "145.209296", char: '1' });
    map.addMarker({"lat" : "-33.868820","lon" : "151.209296", char: '2' });
   }
   else {
    map.clearMarkers();
   }
   marker =! marker;
   screen.render();
}, 1000);

var table =  grid.set(2, 8, 10, 4, contrib.table, 
  { keys: true
  , fg: 'green'
  , label: 'Active Processes'
  , columnSpacing: 1
  , columnWidth: [10,10, 40]})

function generateTable() {
    var data = [];

    readFiles();
    for (var i=0; i < serverStatus.length; i++) {
        var serverObj  = serverStatus[i];
        var messages = serverObj.state.messages;

        for(var j=0; j < messages.length; j++){
            var row = [];
            //location
            row.push(serverObj.loc);
            //server
            row.push(serverObj.server);
            //message
            row.push(messages[j]);

            data.push(row);
        }
    }

    table.setData({headers: ['Location','Server','Message'], data: data})
}

generateTable()
table.focus()
setInterval(generateTable, 3000)

function readFiles(){
    var dataDir = "data/";
    var fileData = [];
    fs.readdir(dataDir,function(err, files){
        if(err){
            return console.error(err);
        }
        serverStatus = [];
        files.forEach(function(file){
            var locServer = parseFileName(file);
            var shellObj = new Object();
            shellObj.loc = locServer[0].toUpperCase();
            shellObj.server = locServer[1].toUpperCase();
            shellObj.state = readFileData(file);
            serverStatus.push(shellObj);
        });
    });
}

function isDataLocked(){
    var isLocked = true;
    fs.stat('data/LOCK', function(err,stat) {
        if ( err == null ) {
            isLocked = true;
        } else if ( err.code == 'ENOENT' ) {
            isLocked = false;
        }
    });
    return isLocked;
}

function parseFileName(file) {
    var a = file.split(".");
    return a[0].split("_");
}

function readFileData(file){
    var contents = fs.readFileSync("data/"+ file);
    var jsonContent = JSON.parse(contents);

    //var jsonContent = {"additionalData":{"railsVersion":"3.2.22.2"},"status":"WARN","messages":["Dependency degraded: rest_site_service","Dependency failed: location_api","Dependency failed: employee_api","Dependency failed: rl_advertiser_rest_service_USA","Dependency failed: subscription_service"],"dependencies":{"database":{"messages":[],"status":"OK"},"memcached":{"messages":[],"status":"OK"},"solr_search":{"messages":[],"status":"OK"},"solr_write":{"messages":[],"status":"OK"},"corp_portal":{"messages":[],"status":"OK"},"rest_site_service":{"messages":["RlHealthCheck::Warning: RlHealthCheck::Warning"],"status":"WARN"},"capture_api":{"messages":[],"status":"OK"},"saml":{"messages":[],"status":"OK"},"intercom_api":{"messages":[],"status":"OK"},"location_api":{"messages":["RlLocationApi::ServiceDown: RlLocationApi::ServiceDown"],"status":"FAIL"},"employee_api":{"messages":["RlEmployeeApi::ServiceDown: RlEmployeeApi::ServiceDown"],"status":"FAIL"},"rl_rest_event_api":{"messages":[],"status":"OK"},"rl_advertiser_rest_service_USA":{"messages":["Services::Rest::ServiceDown: api_base_url https://ws-qa-usa-nx1.qa.reachlocal.com/advertiser-service/rest/v1/advertiser/"],"status":"FAIL"},"business_user_service_USA":{"messages":[],"status":"OK"},"campaign_service_USA":{"messages":[],"status":"OK"},"cts_admin_api_USA":{"messages":[],"status":"OK"},"subscription_service":{"messages":["RlHealthCheck::Failure: RlHealthCheck::Failure"],"status":"FAIL"}}};
//    var jsonContent = {"additionalData":{"railsVersion":"3.4.22"},"status":"OK","messages":[],"dependencies":{"database":{"messages":[],"status":"OK"},"memcached":{"messages":[],"status":"OK"},"solr_search":{"messages":[],"status":"OK"},"solr_write":{"messages":[],"status":"OK"},"corp_portal":{"messages":[],"status":"OK"},"rest_site_service":{"messages":[],"status":"OK"},"capture_api":{"messages":[],"status":"OK"},"saml":{"messages":[],"status":"OK"},"intercom_api":{"messages":[],"status":"OK"},"location_api":{"messages":[],"status":"OK"},"employee_api":{"messages":[],"status":"OK"},"rl_rest_event_api":{"messages":[],"status":"OK"},"rl_advertiser_rest_service_USA":{"messages":[],"status":"OK"},"business_user_service_USA":{"messages":[],"status":"OK"},"campaign_service_USA":{"messages":[],"status":"OK"},"cts_admin_api_USA":{"messages":[],"status":"OK"},"rl_advertiser_rest_service_CAN":{"messages":[],"status":"OK"},"business_user_service_CAN":{"messages":[],"status":"OK"},"campaign_service_CAN":{"messages":[],"status":"OK"},"cts_admin_api_CAN":{"messages":[],"status":"OK"},"subscription_service":{"messages":[],"status":"OK"}}};
    return jsonContent;
}

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
