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
		if(this.get("title") === "pdfUrl" || this.get("title") === "upto"){
			this.set("areaLength", 0);

		}
		if(this.get("title") === "pdfUrl"){
			this.parent.set("pdfUrl", this.get("area"))
		}

		if (this.get("areaLength")) {
			var parentValues = [];
			if(typeof this.get("area") === "object")
				this.get("area").forEach((item) => {
					var keys = [];
					var values = [];
					for (var key in item) {
						if (key != "$$hashKey" && key != "unique_id") {
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
