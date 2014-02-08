/**
 * Attribute Table widget
 *
 * Creates an instance of a dgrid, then fills it with a specified FeatureLayer's data.
 * 
 * TODO: Alot
 */
define(["dojo/Evented", //
"dojo/_base/declare", //
"dojo/_base/lang", //
"dojo/Deferred", //
"dojo/request/xhr", //
"dojo/store/Memory", //
"dojo/i18n!js/Widgets/AttributeTable/nls/messages", //
"dgrid/OnDemandGrid" //
], function(Evented, //
declare, //
lang, //
Deferred, //
xhr, //
Memory, //
i18n, //
Grid //
) {
	return declare([Evented], {
		config: {},
		constructor : function(options) {

			this._init();
			
		},
		
		_init: function(){
			
			var deferred = new Deferred();
			xhr("js/Widgets/AttributeTable/config.json",{
				handleAs : "json",
			}).then(lang.hitch(this, "_configLoaded"));

			
			this.store = new Memory();
			this.grid = new Grid({
				store: this.store
			}, "grid");
			
			//this.grid.startup();
			
			return deferred;
		},
		
		_configLoaded: function(data){
			this.config = data;
		},
		
		/*
		 * Changes the current feature layer
		 * Redefines the dgrid store and layout.
		 */
		setFeatureLayer : function(featureLayer, options) {
		
			this.columns = [];
			
			this.dataConfig = {};
			
			if (this.config.featureLayers && this.config.featureLayers[featureLayer.url]){
				this.dataConfig.fields = this.config.featureLayers[featureLayer.url].fields;
				
				if (this.dataConfig.fields){
					for (var i in this.dataConfig.fields){
						
						for (var j in featureLayer.fields){
							
							if (featureLayer.fields[j].name == this.dataConfig.fields[i]){
								
								this.columns.push({
									field: featureLayer.fields[j].name,
									label: featureLayer.fields[j].alias
								});
								break;
							}
						}
					}

				}
				
			}
			
		 	var data = [];
		 	
		 	for (var i in featureLayer.graphics){
		 		data.push(featureLayer.graphics[i].attributes);
		 	}
		 	
		 	
		 	var fakeData = [
		 		{OBJECTID:"1", NAME:"test", PRETYPE:"test", TYPE:"test", ROAD_CL:"test", L_PLACE:"test"}
		 	];
		 	
		 	this.store.setData(data);
		 	this.store.idProperty = "OBJECTID";

		 	this.grid.setColumns(this.columns);

			this.featureLayer = featureLayer;
			
		},

		startup : function() {
			if (typeof this.featureLayer == 'undefined'){
				this.emit("error", {
					message: i18n.errors.featLayNotSpec
				});
			}
			else {
				
				
			}
			

		}
	});
});
