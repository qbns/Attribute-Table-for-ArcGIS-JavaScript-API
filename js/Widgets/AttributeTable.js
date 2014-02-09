/**
 * Attribute Table widget
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
"esri/layers/GraphicsLayer"], function(Evented, //
declare, //
lang, //
Deferred, //
xhr, //
Memory, //
i18n, //
Grid, //
Keyboard, //
Selection, //
GraphicsLayer) {
	return declare([Evented], {
		config : {},
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
			this.grid = declare([ Grid, Keyboard, Selection ])({
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
		 */
		setFeatureLayer : function(featureLayer, options) {

			if (this._featureLayerUpdateListener) {
				this._featureLayerUpdateListener.remove();
			}

			this.columns = [];

			this.dataConfig = {};

			var idProperty = "id";

			// If specific fields were defined in the config file for this layer
			if (this.config.featureLayers && this.config.featureLayers[featureLayer.url]) {

				this.dataConfig.fields = this.config.featureLayers[featureLayer.url].fields;

				if (this.dataConfig.fields) {
					for (var i in this.dataConfig.fields) {

						if (this.dataConfig.fields[i].toLowerCase() == "objectid") {
							idProperty = this.dataConfig.fields[i];
						}

						for (var j in featureLayer.fields) {

							if (featureLayer.fields[j].name == this.dataConfig.fields[i]) {

								this.columns.push({
									field : featureLayer.fields[j].name,
									label : featureLayer.fields[j].alias
								});
								break;
							}

						}
					}

				}

			}
			// Add all of the layer's fields (except editor / shape / globalid fields)
			else {
				for (var i in featureLayer.fields) {
					this.columns.push({
						field : featureLayer.fields[i].name,
						label : featureLayer.fields[i].alias
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
