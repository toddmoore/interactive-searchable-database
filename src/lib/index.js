import Ractive from 'ractive'
import mainTemplate from '../templates/index.html.txt!text';
import dataTable from './components/dataTable';
import jquery from 'jquery';
import TypeAhead from 'typeahead.js';
import Datums from '../data.json.txt!text';
import Sample from '../sample.json.txt!text';

var key = "1d41uUjUpyzX5SVJGgo7RZfOTmOWBMzBzPhFOLHRUOSE";
var datums = JSON.parse(Datums);
var sample = JSON.parse(Sample);

class App {
	constructor(translations, bloodhound) {
		this.bloodhound = bloodhound;
		this.el = document.querySelector('.interactive');
		this.template = mainTemplate;
		this.data = {
			"subtitle": "whatever",
			"translate": this.handleTranslation,
			"translation": translations
		}
		this.components = {
			DataTable: Ractive.extend(new dataTable())
		}
	}

	handleTranslation(key) {
		return this.get("translation")[key] || `<< NO TRANSLATION for ${key} >>`;
	}

	handleMPNameChange(newValue, oldValue, keypath) {
		this.bloodhound.get(newValue, (suggestions) => {
			this.set("suggestions", suggestions);
		});
	}

	setMp(mp) {
		this.set("selectedPolitician", false);
		this.set("politician", false);
		this.set("politicianData", []);
		this.set("mpname", "");
		var id = mp.context.id;
		this.set("selectedPolitician", true);
		this.set("politician", mp.context);
		this.set("politicianData", sample[id]);
		this.set("mpname", id);
		window.location.hash = "#results";
	}
}

var translations = new Promise((resolved, rejected) => {
	jquery.getJSON(`http://interactive.guim.co.uk/spreadsheetdata/${key}.json`, (
		data) => {
		// TODO: add error
		data = data.sheets.Sheet1;
		var obj = {};
		data.forEach((item) => {
			var _key_ = null;
			var _value_ = null;
			for (var key in item) {
				if (key == "key") {
					_key_ = item[key];
				} else {
					_value_ = item[key];
				}
			}
			obj[_key_] = _value_;
		});
		resolved(obj);
	})
}).then((data) => {
	// Bloodhound
	var bloodhound = new Bloodhound({
		name: 'animals',
		local: datums,
		datumTokenizer: function(d) {
			return Bloodhound.tokenizers.whitespace(d.lastname);
		},
		queryTokenizer: Bloodhound.tokenizers.whitespace
	});
	bloodhound.initialize();

	var app = new App(data, bloodhound);
	var ractive = new Ractive(app);

	// attach proxy
	ractive.on('mpselect', app.setMp);
	// attach observers
	ractive.observe("mpname", app.handleMPNameChange);
});

export default {};
