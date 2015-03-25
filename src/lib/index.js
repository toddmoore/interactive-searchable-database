import Ractive from 'ractive'
import mainTemplate from '../templates/index.html.txt!text';
import dataTable from './components/dataTable';
import jquery from 'jquery';
import TypeAhead from 'typeahead.js';
import Datums from '../data.json.txt!text';
import Datums2 from '../data-text.json.txt!text';
import Sample from '../sample.json.txt!text';

var key = "1d41uUjUpyzX5SVJGgo7RZfOTmOWBMzBzPhFOLHRUOSE";
var datums = JSON.parse(Datums);
var datums2 = JSON.parse(Datums2);
var sample = JSON.parse(Sample);

class App extends Ractive {
  constructor(translations, bloodhound, bloodhound2, id) {
    var self = this;
    var s = id ? sample[id] : sample[datums[0].id];
    var p = datums[0];
    var mp = id ? id : datums[0].id;
    if(id){
      datums.forEach((data, index) => {
        if(data.id == id){
          id = index
        }
      });
    }
    this.bloodhound = bloodhound;
    this.bloodhound2 = bloodhound2;
    this.el = document.querySelector('.interactive');
    this.template = mainTemplate;
    this.data = {
      "id": (id || 0),
      "subtitle": "whatever",
      "translate": this.handleTranslation,
      "translation": translations,
      "baseURL": "http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/",
      "politician": p,
      "politicianData": s,
      "mpname": mp,
      "reset": self._reset_,
      "setPollie": self._setPollie
    }
    this.components = {
      DataTable: Ractive.extend(new dataTable())
    }
  }

  handleTranslation(key) {
    return this.get("translation")[key] || `<< NO TRANSLATION for ${key} >>`;
  }

  handleMPNameChange(newValue, oldValue, keypath) {
    if (newValue == "") {
      this.set("politician", false);
    }
    this.bloodhound.get(newValue, (suggestions) => {
      this.set("suggestions", suggestions);
    });
  }

  handleFullTextSearch(newValue, oldValue, keypath) {
    this.bloodhound2.get(newValue, (suggestions) => {
      this.set("fulltextSuggestions", suggestions);
    });
  }

  _reset_(hash) {
    if (!hash)
      window.location.hash = "";
    this.set("selectedPolitician", false);
    this.set("politician", false);
    this.set("politicianData", []);
    this.set("mpname", "");
  }
  _setPollie(id, mpRef, politicianData) {
    var self = this;
    setTimeout(function() {
      self.set("fulltextSuggestions", false);
    }, 250);

    this.set("suggestions", false);
    this.set("selectedPolitician", true);
    this.set("politician", mpRef);
    this.set("politicianData", politicianData);
    this.set("mpname", id);
    this.set("mpnameFullText", mpRef.val);
    window.location.hash = `#results/${mpRef.lastname}/${mpRef.firstname}`;
  }

  setMp(mp) {
    this.get("reset").call(this);
    var id = mp.context.id;
    datums.forEach((_mp_, index) => {
      if (_mp_.id === id) {
        this.set("id", index);
      }
    });
    this.get("setPollie").call(this, id, mp.context, sample[id]);
  }
  next(context) {

    if (this.get("id") < datums.length - 1) {
      this.get("reset").call(this, true);
      this.set("id", this.get("id") + 1)
      this.get("setPollie").call(this, datums[this.get("id")].id, datums[this
        .get(
          "id")], sample[datums[this.get("id")].id]);

    }
  }
  prev(context) {

    if (this.get("id") != 0) {
      this.get("reset").call(this, true);
      this.set("id", this.get("id") - 1)
      this.get("setPollie").call(this, datums[this.get("id")].id, datums[this
        .get(
          "id")], sample[datums[this.get("id")].id]);
    }
  }
}

var translations = new Promise((resolved, rejected) => {
  jquery.getJSON(
    `http://interactive.guim.co.uk/spreadsheetdata/${key}.json`, (
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
    name: 'lastname',
    local: datums,
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.lastname);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace
  });
  bloodhound.initialize();

  // Bloodhound
  var bloodhound2 = new Bloodhound({
    name: 'textone',
    local: datums2,
    limit: 5,
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.val);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace
  });
  bloodhound2.initialize();
  var id = undefined;
  var hashArray = window.location.hash.split("/");
  if(hashArray[1] && hashArray[2]){
    id = `${hashArray[1]}, ${hashArray[2]}`;
  }

  var app = new App(data, bloodhound, bloodhound2, id);
  var ractive = new Ractive(app);

  // attach proxy
  ractive.on('mpselect', app.setMp);

  ractive.on('incrementNext', app.next);
  ractive.on('incrementPrev', app.prev);
  // attach observers
  ractive.observe("mpname", app.handleMPNameChange);
  ractive.observe("mpnameFullText", app.handleFullTextSearch);
});

export default {};
