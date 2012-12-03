/*
 * @author: Meki Cheraoui, Jeff Thompson
 * See COPYING for copyright and distribution information.
 * This class represents a Name as an array of components where each is a byte array.
 */
 
/*
 * Create a new Name from _components.
 * If _components is a string, parse it as a URI.  Otherwise it is an array of components
 * where each is a string, byte array, ArrayBuffer or Uint8Array. 
 * Convert and store as an array of Uint8Array.
 * If a component is a string, encode as utf8.
 */
var Name = function Name(_components){
	if( typeof _components == 'string') {		
		if(LOG>3)console.log('Content Name String '+_components);
		this.components = Name.createNameArray(_components);
	}
	else if(typeof _components === 'object'){		
		if(LOG>4)console.log('Content Name Array '+_components);
		this.components = [];
        for (var i = 0; i < _components.length; ++i)
            this.add(_components[i]);
	}
	else if(_components==null)
		this.components =[];
	else
		if(LOG>1)console.log("NO CONTENT NAME GIVEN");
};

Name.prototype.getName = function() {
    return this.to_uri();
};

/* Parse name as a URI and return an array of Uint8Array components.
 *
 */
Name.createNameArray = function(name) {
    name = name.trim();
    if (name.length <= 0)
        return [];

    var iColon = name.indexOf(':');
    if (iColon >= 0) {
        // Make sure the colon came before a '/'.
        var iFirstSlash = name.indexOf('/');
        if (iFirstSlash < 0 || iColon < iFirstSlash)
            // Omit the leading protocol such as ndn:
            name = name.substr(iColon + 1, name.length - iColon - 1).trim();
    }
    
  	if (name[0] == '/') {
        if (name.length >= 2 && name[1] == '/') {
            // Strip the authority following "//".
            var iAfterAuthority = name.indexOf('/', 2);
            if (iAfterAuthority < 0)
                // Unusual case: there was only an authority.
                return [];
            else
                name = name.substr(iAfterAuthority + 1, name.length - iAfterAuthority - 1).trim();
        }
        else
            name = name.substr(1, name.length - 1).trim();
    }

	var array = name.split('/');
    
    // Unescape the components.
    for (var i = 0; i < array.length; ++i) {
        var component = unescape(array[i].trim());
        
        if (component.match(/[^.]/) == null) {
            // Special case for component of only periods.  
            if (component.length <= 2) {
                // Zero, one or two periods is illegal.  Ignore this componenent to be
                //   consistent with the C implmentation.
                // This also gets rid of a trailing '/'.
                array.splice(i, 1);
                --i;  
                continue;
            }
            else
                // Remove 3 periods.
                array[i] = component.substr(3, component.length - 3);
        }
        else
            array[i] = component;
        
        // Change the component to Uint8Array now.
        array[i] = DataUtils.toNumbersFromString(array[i]);
    }

	return array;
}


Name.prototype.from_ccnb = function(/*XMLDecoder*/ decoder)  {
		decoder.readStartElement(this.getElementLabel());

		
		this.components = new Array(); //new ArrayList<byte []>();

		while (decoder.peekStartElement(CCNProtocolDTags.Component)) {
			this.add(decoder.readBinaryElement(CCNProtocolDTags.Component));
		}
		
		decoder.readEndElement();
};

Name.prototype.to_ccnb = function(/*XMLEncoder*/ encoder)  {
		
		if( this.components ==null ) 
			throw new Error("CANNOT ENCODE EMPTY CONTENT NAME");

		encoder.writeStartElement(this.getElementLabel());
		var count = this.components.length;
		for (var i=0; i < count; i++) {
			encoder.writeElement(CCNProtocolDTags.Component, this.components[i]);
		}
		encoder.writeEndElement();
};

Name.prototype.getElementLabel = function(){
	return CCNProtocolDTags.Name;
};

/*
 * component is a string, byte array, ArrayBuffer or Uint8Array.
 * Convert to Uint8Array and add to this Name.
 * If a component is a string, encode as utf8.
 * Return the converted value.
 */
Name.prototype.add = function(component){
    var result;
    if(typeof component == 'string')
        result = DataUtils.stringToUtf8Array(component);
	else if(typeof component == 'object' && component instanceof Uint8Array)
        result = new Uint8Array(component);
	else if(typeof component == 'object' && component instanceof ArrayBuffer) {
        // Make a copy.  Don't use ArrayBuffer.slice since it isn't always supported.
        result = new Uint8Array(new ArrayBuffer(component.byteLength));
        result.set(new Uint8Array(component));
    }
	else if(typeof component == 'object')
        // Assume component is a byte array.  We can't check instanceof Array because
        //   this doesn't work in JavaScript if the array comes from a different module.
        result = new Uint8Array(component);
	else 
		throw new Error("Cannot add Name element at index " + this.components.length + 
            ": Invalid type");
    
	return this.components.push(result);
};

// Return the escaped name string according to "CCNx URI Scheme".
Name.prototype.to_uri = function() {	
	var result = "";
	
	for(var i = 0; i < this.components.length; ++i)
		result += "/"+ Name.toEscapedString(this.components[i]);
	
	return result;	
};

/*
 * Return a new Name with the first nComponents components of this Name.
 */
Name.prototype.getPrefix = function(nComponents) {
    return new Name(this.components.slice(0, nComponents));
}

/*
 * Return a new ArrayBuffer of the component at i.
 */
Name.prototype.getComponent = function(i) {
    var result = new ArrayBuffer(this.components[i].length);
    new Uint8Array(result).set(this.components[i]);
    return result;
}

/*
 * The "file name" in a name is the last component that isn't blank and doesn't start with one of the
 *   special marker octets (for version, etc.).  Return the index in this.components of
 *   the file name, or -1 if not found.
 */
Name.prototype.indexOfFileName = function() {
    for (var i = this.components.length - 1; i >= 0; --i) {
        var component = this.components[i];
        if (component.length <= 0)
            continue;
        
        if (component[0] == 0 || component[0] == 0xC0 || component[0] == 0xC1 || 
            (component[0] >= 0xF5 && component[0] <= 0xFF))
            continue;
        
        return i;
    }
    
    return -1;
}

/*
 * Find the last component in name that has a ContentDigest and return the digest value as Uint8Array, 
 *   or null if not found.
 * A ContentDigest component is Name.ContentDigestPrefix + 32 bytes + Name.ContentDigestSuffix.
 */
Name.prototype.getContentDigestValue = function() {
    var digestComponentLength = Name.ContentDigestPrefix.length + 32 + Name.ContentDigestSuffix.length; 
    for (var i = this.components.length - 1; i >= 0; --i) {
        // Check for the correct length and equal ContentDigestPrefix and ContentDigestSuffix.
        if (this.components[i].length == digestComponentLength &&
            DataUtils.arraysEqual(this.components[i].subarray(0, Name.ContentDigestPrefix.length), 
                                  Name.ContentDigestPrefix) &&
            DataUtils.arraysEqual(this.components[i].subarray
               (this.components[i].length - Name.ContentDigestSuffix.length, this.components[i].length),
                                  Name.ContentDigestSuffix))
           return this.components[i].subarray
               (Name.ContentDigestPrefix.length, Name.ContentDigestPrefix.length + 32);
    }
    
    return null;
}

// Meta GUID "%C1.M.G%C1" + ContentDigest with a 32 byte BLOB. 
Name.ContentDigestPrefix = new Uint8Array([0xc1, 0x2e, 0x4d, 0x2e, 0x47, 0xc1, 0x01, 0xaa, 0x02, 0x85]);
Name.ContentDigestSuffix = new Uint8Array([0x00]);

/**
 * Return component as an escaped string according to "CCNx URI Scheme".
 * We can't use encodeURIComponent because that doesn't encode all the characters we want to.
 */
Name.toEscapedString = function(component) {
    var result = "";
    var gotNonDot = false;
    for (var i = 0; i < component.length; ++i) {
        if (component[i] != 0x2e) {
            gotNonDot = true;
            break;
        }
    }
    if (!gotNonDot) {
        // Special case for component of zero or more periods.  Add 3 periods.
        result = "...";
        for (var i = 0; i < component.length; ++i)
            result += ".";
    }
    else {
        for (var i = 0; i < component.length; ++i) {
            var value = component[i];
            // Check for 0-9, A-Z, a-z, (+), (-), (.), (_)
            if (value >= 0x30 && value <= 0x39 || value >= 0x41 && value <= 0x5a ||
                value >= 0x61 && value <= 0x7a || value == 0x2b || value == 0x2d || 
                value == 0x2e || value == 0x5f)
                result += String.fromCharCode(value);
            else
                result += "%" + (value < 16 ? "0" : "") + value.toString(16).toUpperCase();
        }
    }
    return result;
};
