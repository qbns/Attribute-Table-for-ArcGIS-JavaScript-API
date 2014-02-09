/*
 * Attribute Table Widget
 */
define(["dojo/Evented", //
"dojo/_base/declare", //
"dojo/_base/lang", //
"dojo/Deferred", //
"dojo/request/xhr", //
"dojo/store/Memory", //
"dojo/i18n!js/Widgets/AttributeTable/nls/messages", //
"dgrid/OnDemandGrid", //
"dgrid/Keyboard", //
"dgrid/Selection", //
"dgrid/extensions/ColumnHider", //
"esri/layers/GraphicsLayer"], //
function(Evented, //
declare, //
lang, //
Deferred, //
xhr, //
Memory, //
i18n, //
Grid, //
Keyboard, //
Selection, //
ColumnHider, //
GraphicsLayer) {
	return declare([Evented], {
		config : {},

		/*
		 * @param {Object} options
		 * @param {esri/Map} map
		 * @param {String} targetId
		 */
		constructor : function(options, map, targetId) {

			this._map = map;
			this._targetId = targetId;
			this._init(options);

		},

		_init : function(options) {

			// Load configuration file
			var deferred = new Deferred();
			xhr("js/Widgets/AttributeTable/config.json", {
				handleAs : "json",
			}).then(lang.hitch(this, "_configLoaded"));

			// Initialize Memory Store and DGrid
			this.store = new Memory();
			this.grid = declare([ Grid, Keyboard, Selection, ColumnHider ])({
				store : this.store
			}, this._targetId);

			// Set options for the DGrid
			if (options.dgrid) {
				lang.mixin(this.grid, options.dgrid);
			}

			this._configureAttTableGraphicsLayer();

			return deferred;
		},

		_configLoaded : function(data) {
			this.config = data;
		},

		_configureAttTableGraphicsLayer : function() {

			// If there is more than one attribute table, there will be more than one Attribute Table graphics layer
			var layerNumber = 0;
			var layerName = "AttrTableGfxLayer";

			while (this._map.getLayer(layerName + layerNumber)) {
				layerNumber += 1;
			}

			layerName = layerName + layerNumber;

			this._graphicsLayer = new GraphicsLayer({
				id : layerName
			});

			this._map.addLayer(this._graphicsLayer);

		},

		/*
		 * Change current feature layer,
		 * redefines the dgrid columns and populates the store.
		 *
		 * @param {FeatureLayer} featureLayer
		 * @param {Object} [options]
		 */
		setFeatureLayer : function(featureLayer, options) {

			if (this._featureLayerUpdateListener) {
				this._featureLayerUpdateListener.remove();
			}

			this.columns = [];

			var hiddenColumns = this.config.hiddenColumnsLowerCase || [];

			var columnsConfig = {};

			var idProperty = "id";

			// If specific fields were defined in the config file for this layer
			if (this.config.featureLayers && this.config.featureLayers[featureLayer.url]) {

				columnsConfig.fields = this.config.featureLayers[featureLayer.url].fields;

				if (columnsConfig.fields) {
					for (var i in columnsConfig.fields) {

						if (columnsConfig.fields[i].toLowerCase() == "objectid") {
							idProperty = columnsConfig.fields[i];
						}

						for (var j in featureLayer.fields) {

							if (featureLayer.fields[j].name == columnsConfig.fields[i]) {

								var isHidden = false;
								if (hiddenColumns) {
									for (var k in hiddenColumns) {
										if (featureLayer.fields[j].name.toLowerCase().indexOf(hiddenColumns[k]) >= 0) {
											isHidden = true;
											break;
										}
									}
								}

								this.columns.push({
									field : featureLayer.fields[j].name,
									label : featureLayer.fields[j].alias,
									hidden : isHidden
								});
								break;
							}

						}
					}

				}

			}
			// Add all of the layer's fields (keep editor / shape / globalid fields hidden)
			else {

				for (var i in featureLayer.fields) {

					var isHidden = false;
					if (hiddenColumns) {
						for (var j in hiddenColumns) {
							if (featureLayer.fields[i].name.toLowerCase().indexOf(hiddenColumns[j]) >= 0) {
								isHidden = true;
								break;
							}
						}
					}

					this.columns.push({
						field : featureLayer.fields[i].name,
						label : featureLayer.fields[i].alias,
						hidden : isHidden
					});
				}
			}

			this.store.idProperty = idProperty;

			this.featureLayer = featureLayer;

			this._featureLayerUpdateListener = featureLayer.on("update-end", lang.hitch(this, 'populateStore'));

			this.populateStore();

			this.grid.setColumns(this.columns);

		},

		/*
		 * Fill the Memory store with the feature layer's attributes
		 */
		populateStore : function() {

			var data = [];

			for (var i in this.featureLayer.graphics) {
				data.push(this.featureLayer.graphics[i].attributes);
			}

			this.store.setData(data);
			this.grid.refresh();
		}
	});
});
