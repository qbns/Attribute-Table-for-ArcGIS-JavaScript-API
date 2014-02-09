The Attribute Table for ArcGIS JavaScript API.
==============================================

This widget displays contents of a given feature layer using the awesome DGrid by SitePen.  
  
  
The widget itself isn't a sophisticated piece of code (yet :D). I do not know many od Dojo and AMD's secrets but maybe someone will find it useful.  


## Current features:
1. Switch feature layer on the fly.
2. Support for internationalization.  
Soon there will be more;]

## How to use it:

The AttributeTable constructor requires three parameters:
1. options  
2. reference to the map  
3. specify the id af an element, where the attribute table will be placed  
 
Example code that initializes the attribute table:

```javascript
var attributeTable = new AttributeTable({
    /* attribute table options */
    dgrid: {
        /* options that will be passed to the DGrid instance */
    }
}, map, "targetElementId");
```

