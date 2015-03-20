import Ractive from 'ractive'
import mainTemplate from '../templates/index.html.txt!text';
import dataTable from './components/dataTable';
import jquery from 'jquery';
import TypeAhead from 'typeahead.js';
import Datums from '../data.json.txt!text';
import Sample from '../sample.json.txt!text';

var datums = JSON.parse(Datums);
var sample = JSON.parse(Sample);

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

class App {
  constructor() {
    this.el = document.querySelector('.interactive');
    this.template = mainTemplate;
    this.data = {
      "subtitle": "whatever"
    }
    this.components = {
      DataTable: Ractive.extend(new dataTable())
    }
  }

  handleMPNameChange(newValue, oldValue, keypath) {
    this.set("selectedPolitician", null);
    bloodhound.get(newValue, (suggestions) => {
      this.set("suggestions", suggestions);
    });
  }

  setMp(mp) {
    var id = mp.context.id;
    var keys = [];
    for (var key in sample[id]) {
      keys.push(key);
    }
    this.set("titles", keys);
    this.set("selectedPolitician", true);
    this.set("politician", mp.context);
    this.set("politicianData", sample[id])
    console.log(this.get("politicianData"));
    this.set("mpname", id);
  }
}


// Instantiate the app
var app = new App();
var ractive = new Ractive(app);

// attach proxy
ractive.on('mpselect', app.setMp);
// attach observers
ractive.observe("mpname", app.handleMPNameChange);

export default {};
