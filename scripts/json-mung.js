var querystring = require('querystring');
var request = require('request');
var fs = require('fs');

var host = 'interactive.guim.co.uk';

function performRequest(endpoint, method, data, success, index) {
		request("http://" + host + "/" + endpoint, function(err, response, body) {
			//console.log(response);
			if (!err) {
				success(JSON.parse(response.body))
					//success(response);
			}
		})

	}
	// http://pybossa-1954812815.ap-southeast-2.elb.amazonaws.com/api/taskrun?task_id=507

responses = [];
lastIndex = null;
currentIndex = 1;
incrementBy = 1;
killAt = 1;

function createJSON() {
	var outputFilename =
		'/Users/tmoore/Development/interactive-searchable/scripts/data.json';
	fs.writeFile(outputFilename, JSON.stringify(responses, null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + outputFilename);
		}
	});
}

function go(taskid) {
	performRequest(
		'spreadsheetdata/1sAiMqicFHT89giaV322VPu1bPFzKWI8vWvGeWR7-uwg.json', "GET",
		"",
		function(data) {
			var obj = {

			}
			for (var i = 0; i < data.sheets.Sheet1.length; i++) {
				obj[data.sheets.Sheet1[i].politician] = {
					firstname: data.sheets.Sheet1[i].firstname,
					lastname: data.sheets.Sheet1[i].lastname,
					id: data.sheets.Sheet1[i].politician
				}
			};
			for (var item in obj) {
				responses.push(obj[item])
			}
			createJSON();
		}, taskid);
}

function start() {
	for (var i = currentIndex; i < currentIndex + incrementBy; i++) {
		if (i <= killAt) {
			go(i);
		}
		if (i == (currentIndex + incrementBy) - 1) {
			currentIndex = currentIndex + incrementBy;
			break;
		}
	}
}
start()
