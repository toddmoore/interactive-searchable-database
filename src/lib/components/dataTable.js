import dataTableTemplate from
	'../../templates/components/dataTable.html.txt!text'

class DataTableComponent {
	constructor() {
		this.template = dataTableTemplate;
		this.isolated = false;
		this.data = function() {
			return {
				area: null,
				title: null,
				keys: [],
				values: []
			};
		};
	}

	init() {
		this.set("areaLength", this.get("area").length);
		if (this.get("areaLength")) {
			var parentValues = [];
			this.get("area").forEach((item) => {
				console.log(this.get("area"), this.get("values"))
				var keys = [];
				var values = [];
				for (var key in item) {
					if (key != "$$hashKey") {
						keys.push(key);
						values.push(item[key]);
					}
				}
				parentValues.push(values)
				this.set("keys", keys);
			});
			this.set("values", parentValues);
		}
	}
}

export default DataTableComponent;
