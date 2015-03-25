var fs = require('fs');
var clj_fuzzy = require('clj-fuzzy');
var hash = require('object-hash');

var obj = JSON.parse(fs.readFileSync('./notley-onwards.json', 'utf8'));
var obj_other = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
console.log(JSON.stringify(obj).length)
var a = [];
obj.forEach(function(item) {


	for (var key in item) {
		var textNodes = [];
		__key = key;
		var o = item[key];
		for (var _key_ in o) {
			if ((typeof o[_key_] === "object") && (o[_key_].length)) {

				o[_key_].forEach(function(arr) {

					arr.forEach(function(obj_item, masterIndex) {
						for (var kk in obj_item) {
							if (typeof obj_item[kk] == "string") {
								if (kk != "$$hashKey") {
									a.push({
										"val": obj_item[kk],
										"id": key
									});
								}

							}

						}

					});

				});


			}
		}

	}


});
console.log(JSON.stringify(obj).length);
var outputFilename =
	'/Users/tmoore/Development/interactive-searchable/scripts/data-text.json';
fs.writeFile(outputFilename, JSON.stringify(a, null, 4), function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("JSON saved to " + outputFilename);
	}
});
