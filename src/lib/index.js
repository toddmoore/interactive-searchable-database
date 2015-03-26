import Ractive from 'ractive';
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
        this.bloodhound = bloodhound;
        this.bloodhound2 = bloodhound2;
        this.el = document.querySelector('.interactive');
        this.template = mainTemplate;

        /*
        * Cehcks the id and if it matches then set the index
        * to this index
        * */
        var s = id ? sample[id] : sample[datums[0].id];
        var p = datums[0];
        var mp = id ? id : datums[0].id;
        if (id) {
            datums.forEach((data, index) => {
                if (data.id == id) {
                    id = index
                }
            });
        }

        /*
        * Main block of data
        * */
        this.data = {
            "id": (id || 0),
            "subtitle": "whatever",
            "translate": this.handleTranslation,
            "translateAndEscape": this.handleTranslationAndEscape,
            "translation": translations,
            "baseURL": "http://interactive.guim.co.uk/next-gen/au/2015/mar/interactive-searchable/",
            "politician": p,
            "politicianData": s,
            "mpname": mp,
            "reset": self._reset_,
            "setPollie": self._setPollie,
            "pdfUrl": ""
        }
        /*
        * Main dataTable Component for creating data
        * */
        this.components = {
            DataTable: Ractive.extend(new dataTable())
        }
    }
    /*
    * Handler for Translation
    * */
    handleTranslation(key) {
        return this.get("translation")[key] || `<< NO TRANSLATION for ${key} >>`;
    }

    /*
    * Handler for translation and URL escapes
    * */
    handleTranslationAndEscape(key) {
        var text = this.get("translate").call(this, key);
        return encodeURIComponent(text);
    }
    /*
    * Handles the MP name change
    * */
    handleMPNameChange(newValue, oldValue, keypath) {
        if (newValue == "") {
            this.set("politician", false);
        }
        this.bloodhound.get(newValue, (suggestions) => {
            this.set("suggestions", suggestions);
        });
    }
    /*
    * Handles Full Text Searching
    * */
    handleFullTextSearch(newValue, oldValue, keypath) {
        this.bloodhound2.get(newValue, (suggestions) => {
            this.set("fulltextSuggestions", suggestions);
        });
    }

    /*
    * Resets the data
    * */
    _reset_(hash) {
        if (!hash)
            window.location.hash = "";
        this.set("selectedPolitician", false);
        this.set("politician", false);
        this.set("politicianData", []);
        this.set("mpname", "");
    }

    /*
    * Context is lost so assign these to the data object in ractive
    * */
    _setPollie(id, mpRef, politicianData) {
        var self = this;
        setTimeout(function () {
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

    /*
    * Main method used to set the politician
    * */
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

    /*
    * navigation iterator for politician data
    * */
    next(context) {

        if (this.get("id") < datums.length - 1) {
            this.get("reset").call(this, true);
            this.set("id", this.get("id") + 1)
            this.get("setPollie").call(this, datums[this.get("id")].id, datums[this
                .get(
                "id")], sample[datums[this.get("id")].id]);

        }
    }
    /*
    * navigation iterator for politician data
    * */
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


/*
 * Loads the translations spreadsheet
 *
 * */
var translations = new Promise((resolved, rejected) => {
    jquery.getJSON(
        `http://interactive.guim.co.uk/spreadsheetdata/${key}.json`, (data) => {
            // Creates a single key -> value object
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
        // Get the id from a hash
        var id = undefined;
        var hashArray = window.location.hash.split("/");
        if (hashArray[1] && hashArray[2]) {
            id = `${hashArray[1]}, ${hashArray[2]}`;
        }

        // Fire up the bloodhounds by lastname
        var lastname = new Bloodhound({
            name: 'lastname',
            local: datums,
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.lastname);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });

        // Bloodhound
        var fulltext = new Bloodhound({
            name: 'textone',
            local: datums2,
            limit: 5,
            datumTokenizer: function (d) {
                return Bloodhound.tokenizers.whitespace(d.val);
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });


        lastname.initialize() && fulltext.initialize();
        var app = new App(data, lastname, fulltext, id);
        var ractive = new Ractive(app);

        ractive.on('mpselect', app.setMp);
        ractive.on('incrementNext', app.next);
        ractive.on('incrementPrev', app.prev);
        ractive.observe("mpname", app.handleMPNameChange);
        ractive.observe("mpnameFullText", app.handleFullTextSearch);
    });

export default {};
