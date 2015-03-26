var browserstack = require('browserstack'),
  fs = require('fs'),
  request = require('request');

var defaults = {
  "url": "http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable",
  "timeout": 300
};
var browsers = JSON.parse(fs.readFileSync('./chaff/browsers-supported.json', 'utf8'));
var client = browserstack.createClient({
    username: "toddmoore3",
    password: "pboBKsBTe612dGsi3os1"
});
browsers.forEach(function(browser){
  browser.url = defaults.url;
  browser.timeout = defaults.timout;
  client.createWorker(browser, function(error, worker){
    client.getWorker(worker.id, function(error, worker){    
      var check = function(){
        client.getWorker(worker.id, function(error, worker){
          if(worker.status != "running"){
            setTimeout(function(){
              check();
            }, 200)
          }else{
            setTimeout(function(){
              client.takeScreenshot(worker.id, function(err, data){
                request(data.url).pipe(fs.createWriteStream('./chaff/'+browser.browser+browser.browser_version+browser.os_version+'.png')).on('close', function(){
                  client.terminateWorker(worker.id, function(err, data){
                    console.log('done', data);
                  });
                });
              });
            }, 60000);
          }
        });
      }
      if(worker.status != "running"){
        check();
      }
    });
  });
});
