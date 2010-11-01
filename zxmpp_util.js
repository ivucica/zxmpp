/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */

zxmppClass.prototype.util = function (zxmpp)
{
	this.zxmpp = zxmpp;

	// http://www.webreference.com/programming/javascript/definitive2/

	/**
	 * Create a new Document object. If no arguments are specified,
	 * the document will be empty. If a root tag is specified, the document
	 * will contain that single root tag. If the root tag has a namespace
	 * prefix, the second argument must specify the URL that identifies the
	 * namespace.
	 */
	this.newXMLDocument = function(rootTagName, namespaceURL) {
	  if (!rootTagName) rootTagName = "";
	  if (!namespaceURL) namespaceURL = "";
	  if (document.implementation && document.implementation.createDocument) {
	    // This is the W3C standard way to do it
	    return document.implementation.createDocument(namespaceURL, rootTagName, null);
	  }
	  else { // This is the IE way to do it
	    // Create an empty document as an ActiveX object
	    // If there is no root element, this is all we have to do
	    var doc = new ActiveXObject("MSXML2.DOMDocument");
	    // If there is a root tag, initialize the document
	    if (rootTagName) {
	      // Look for a namespace prefix
	      var prefix = "";
	      var tagname = rootTagName;
	      var p = rootTagName.indexOf(':');
	      if (p != -1) {
	        prefix = rootTagName.substring(0, p);
	        tagname = rootTagName.substring(p+1);
	      }
	      // If we have a namespace, we must have a namespace prefix
	      // If we don't have a namespace, we discard any prefix
	      if (namespaceURL) {
	        if (!prefix) prefix = "a0"; // What Firefox uses
	      }
	      else prefix = "";
	      // Create the root element (with optional namespace) as a
	      // string of text
	      var text = "<" + (prefix?(prefix+":"):"") +  tagname +
	          (namespaceURL
	           ?(" xmlns:" + prefix + '="' + namespaceURL +'"')
	           :"") +
	          "/>";
	      // And parse that text into the empty document
	      doc.loadXML(text);
	    }
	    return doc;
	  }
	};
	
	
	// adapted from w3schools
	this.parsedXMLDocument = function(txt)
	{
		if(window.DOMParser)
		{
			return (new DOMParser()).parseFromString(txt, "text/xml");
		}
		else
		{
			// ie
			xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(txt);
			return xmlDoc;
		}
	}
	
	// by Ivan Vucica
	this.serializedXML = function(xml)
	{
		return (new XMLSerializer()).serializeToString(xml);
	}
	
	// by Ivan Vucica
	this.easierAttrs = function(xml)
	{
		xml.attr = {};
		for(var i in xml.attributes)
		{
			xml.attr[xml.attributes[i].nodeName] = xml.attributes[i].nodeValue;
		}
		return xml.attr;
	}
	
	
	
	/****** base64 code **********/
	
	// This code was written by Tyler Akins and has been placed in the
	// public domain.  It would be nice if you left this header intact.
	// Base64 code from Tyler Akins -- http://rumkin.com
	
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	
	
	var zxmpp_ua = navigator.userAgent.toLowerCase();
	if (zxmpp_ua.indexOf(" chrome/") >= 0 || zxmpp_ua.indexOf(" firefox/") >= 0 || zxmpp_ua.indexOf(' gecko/') >= 0) {
		this.StringMaker = function () {
			this.str = "";
			this.length = 0;
			this.append = function (s) {
				this.str += s;
				this.length += s.length;
			}
			this.prepend = function (s) {
				this.str = s + this.str;
				this.length += s.length;
			}
			this.toString = function () {
				return this.str;
			}
		}
	} else {
		this.StringMaker = function () {
			this.parts = [];
			this.length = 0;
			this.append = function (s) {
				this.parts.push(s);
				this.length += s.length;
			}
			this.prepend = function (s) {
				this.parts.unshift(s);
				this.length += s.length;
			}
			this.toString = function () {
				return this.parts.join('');
			}
		}
	}
	
	
	this.encode64 = function (input) {
		var output = new this.StringMaker();
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
	
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
	
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
	
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
	
			output.append(keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4));
	   }
	   
	   return output.toString();
	}
	
	this.decode64 = function (input) {
		var output = new this.StringMaker();
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
	
		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	
		while (i < input.length) {
			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));
	
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
	
			output.append(String.fromCharCode(chr1));
	
			if (enc3 != 64) {
				output.append(String.fromCharCode(chr2));
			}
			if (enc4 != 64) {
				output.append(String.fromCharCode(chr3));
			}
		}
	
		return output.toString();
	}
	
	
	
	
	// webtoolkit.info/javascript-sha1.html
	
	/**
	*
	*  Secure Hash Algorithm (SHA1)
	*  http://www.webtoolkit.info/
	*
	**/
	 
	this.SHA1 = function (msg) {
	 
		function rotate_left(n,s) {
			var t4 = ( n<<s ) | (n>>>(32-s));
			return t4;
		};
	 
		function lsb_hex(val) {
			var str="";
			var i;
			var vh;
			var vl;
	 
			for( i=0; i<=6; i+=2 ) {
				vh = (val>>>(i*4+4))&0x0f;
				vl = (val>>>(i*4))&0x0f;
				str += vh.toString(16) + vl.toString(16);
			}
			return str;
		};
	 
		function cvt_hex(val) {
			var str="";
			var i;
			var v;
	 
			for( i=7; i>=0; i-- ) {
				v = (val>>>(i*4))&0x0f;
				str += v.toString(16);
			}
			return str;
		};
	 
	 
		function Utf8Encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		};
	 
		var blockstart;
		var i, j;
		var W = new Array(80);
		var H0 = 0x67452301;
		var H1 = 0xEFCDAB89;
		var H2 = 0x98BADCFE;
		var H3 = 0x10325476;
		var H4 = 0xC3D2E1F0;
		var A, B, C, D, E;
		var temp;
	 
		msg = Utf8Encode(msg);
	 
		var msg_len = msg.length;
	 
		var word_array = new Array();
		for( i=0; i<msg_len-3; i+=4 ) {
			j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
			msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
			word_array.push( j );
		}
	 
		switch( msg_len % 4 ) {
			case 0:
				i = 0x080000000;
			break;
			case 1:
				i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
			break;
	 
			case 2:
				i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
			break;
	 
			case 3:
				i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8	| 0x80;
			break;
		}
	 
		word_array.push( i );
	 
		while( (word_array.length % 16) != 14 ) word_array.push( 0 );
	 
		word_array.push( msg_len>>>29 );
		word_array.push( (msg_len<<3)&0x0ffffffff );
	 
	 
		for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
	 
			for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
			for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
	 
			A = H0;
			B = H1;
			C = H2;
			D = H3;
			E = H4;
	 
			for( i= 0; i<=19; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	 
			for( i=20; i<=39; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	 
			for( i=40; i<=59; i++ ) {
				temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	 
			for( i=60; i<=79; i++ ) {
				temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
				E = D;
				D = C;
				C = rotate_left(B,30);
				B = A;
				A = temp;
			}
	 
			H0 = (H0 + A) & 0x0ffffffff;
			H1 = (H1 + B) & 0x0ffffffff;
			H2 = (H2 + C) & 0x0ffffffff;
			H3 = (H3 + D) & 0x0ffffffff;
			H4 = (H4 + E) & 0x0ffffffff;
	 
		}
	 
		var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	 
		return temp.toLowerCase();
	 
	}
	
	
	/**********************
	 * clone object func  *
	 *********************/
	 // http://oranlooney.com/deep-copy-javascript/
	this.cloneObject = function(obj) {
        return owl.copy(obj);
    }



    this.prettyJson = function(jsonified)
    {
    
	    var nSpaces = function(n)
	    {
		var r = "";
		for(var i=0; i<n; i++)
		    r += " ";
		return r;
	    }
	    var prettyjson = "";
	    var depth = 0;
	    var inString = false;
	    var escaping = false;
	    for(var i=0; i<jsonified.length; i++)
	    {
		if(!inString && !escaping)
		{
		    switch(jsonified[i])
		    {
			case "\"":
			inString = true;
			prettyjson += "\"";
			break;
			case "[":
			case "{":
			prettyjson += jsonified[i] + "\n";
			depth++;
			prettyjson += nSpaces(depth*3);
			break;
			
			case "]":
			case "}":
			if(prettyjson[prettyjson.length-1]==" ")
			{
			    prettyjson = prettyjson.substr(0, prettyjson.length-3);
			    prettyjson += jsonified[i];// + "\n";
			}
			else
			{
			    prettyjson += "\n";
			    prettyjson += nSpaces(depth*3 - 3);

			    prettyjson += jsonified[i];
			}
			depth--;
			//prettyjson += nSpaces(depth*3);
			break;
			
			case ",":
			prettyjson += ",\n";
			prettyjson += nSpaces(depth*3);
			break;
			
			case ":":
			prettyjson += " : ";
			break;
			
			default:
			prettyjson += jsonified[i];
		    }
		}
		else
		{
		
		    prettyjson += jsonified[i];
		    if(escaping)
		    {
		    }
		    else if(inString && jsonified[i] == "\"")
		    {
			inString = false;
		    }
		    else if(inString && jsonified[i] == "\\")
		    {
			escaping = true;
		    }
		}
	    }
	    return prettyjson;
    }
	
};




if(!console)
{
	console = function()
	{
		this.log = function(msg)
		{
			// stub
		}
		this.warn = this.log;
		this.error = this.log;
	};

}
