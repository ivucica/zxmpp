/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */
 
// typically represents caps of a single entity on xmpp network,
// but can also be cached in a node
zxmppClass.prototype.caps = function(zxmpp)
{
	this.zxmpp = zxmpp;
	this.type = "caps";

	this.node = false;
	this.ver = false;
	this.ext = false;
	this.hash = false;
	
	this.features = {};
	this.featuresExt = {};
	this.ownerJid = false;
	this.ownerNode = false;
	
	this.nodeCategory = false;
	this.nodeType = false;
	this.nodeName = false;
	
	// FIXME hash="sha-1"; perhaps dont use it in database key?
	
	
	this.parseXML = function (xml) // parse "c"
	{
		
		// XEP-0115-3:
		//	<c xmlns='http://jabber.org/protocol/caps' node='http://psi-im.org/caps' ver='caps-b75d8d2b25' ext='ca cs ep-notify html'/>
		// latest XEP-0115-4 (as of oct 2010) also includes hash
		
		this.zxmpp.util.easierAttrs(xml);
		
		this.node = xml.attr["node"];
		this.ver = xml.attr["ver"];
		this.ext = xml.attr["ext"];
		this.hash = xml.attr["hash"];
		
		this.ownerNode = this.node + "#" + this.ver;
		
		
		
		// if we already know caps, skip
		if(this.hash)
		{
			// XEP-0115-4
			// we can use node database
			
			// let's first discover each ext we don't know about
			if(!this.zxmpp.capsNodesExt[this.ownerNode + "#" + this.hash])
				this.zxmpp.capsNodesExt[this.ownerNode + "#" + this.hash] = {};
			var extdest = this.zxmpp.capsNodesExt[this.ownerNode + "#" + this.hash];
			
			this.unpackExt(extdest);
			
			
			
			if(this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash])
			{
				// replace this instance in its owner zxmpp::presence with
				// the cached zxmpp::caps based on the hash
				
				this.zxmpp.getPresence(this.ownerJid).caps = this.zxmpp.util.cloneObject(this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash]);
				this.zxmpp.getPresence(this.ownerJid).caps.ownerJid = this.ownerJid;
					
				return;
			}
		}
		else
		{
			// XEP-0115-3 legacy format
			// using database is impossible,
			// since we cannot verify caps
			

			// let's first discover each ext we don't know about
			if(!this.zxmpp.capsNodesExt[this.ownerNode])
				this.zxmpp.capsNodesExt[this.ownerNode] = {};
			var extdest = this.zxmpp.capsNodesExt[this.ownerNode];
			
			this.unpackExt(extdest);
			

			
			// TODO decide if we will trust clients that dont serve us hash
			// for now we will trust 
			if(this.zxmpp.capsNodes[this.ownerNode])
			{
				// replace this instance in its owner zxmpp::presence with
				// the cached zxmpp::caps, based on just the node+ver
				
				this.zxmpp.getPresence(this.ownerJid).caps = this.zxmpp.util.cloneObject(this.zxmpp.capsNodes[this.ownerNode]);
				this.zxmpp.getPresence(this.ownerJid).caps.ownerJid = this.ownerJid;
				
				return;
			}

		}

		
		// discover caps by sending disco info
		if(!this.ownerJid)
		{
			console.error("zxmpp::caps::parseXML(): Cannot discover caps since ownerJid is not set");
			return; 
		}
		
		console.log("Asking " + this.ownerJid + " about caps");
		this.zxmpp.stream.sendIqQuery("http://jabber.org/protocol/disco#info", "get", this.ownerJid, false, {"node": this.node + "#" + this.ver});
		
		
	}

	this.finishProcessing = function()
	{
		
		// TODO must copy, not reference, and then replace ownerJid with 'false'!

		if(this.hash)
		{
			// TODO add hash spoofing verification!
			
			this.zxmpp.capsNodes[this.ownerNode + "#" + this.hash] = this.zxmpp.util.cloneObject(this);
		}
		else
		{
			// TODO decide if we should trust the client without a hash!
			// let's still cache based on ver, and trust
			
			this.zxmpp.capsNodes[this.ownerNode] = this.zxmpp.util.cloneObject(this);
		}
	}


	this.appendToXML = function(packet, xml)
	{
		// FIXME currently we add constant values.
		// we should actually add values stored in this caps instance!
		// idea: function "this.useThisClientDefaults" which'll set defaults
	
		if(!this.ver)	
			this.ver = "0.1." + (new Date().getTime());

		this.featuresExt["voice-v1"]=[];
		this.featuresExt["video-v1"]=[];
		this.featuresExt["camera-v1"]=[];
		
		var cnode = packet.xml.createElementNS("http://jabber.org/protocol/caps", "c");
		cnode.setAttribute("node", "http://ivan.vucica.net/zxmpp/heh"); // FIXME move client identifier to global var
		cnode.setAttribute("ver", this.ver); // TODO implement proper, hashed "ver"-ification string
		cnode.setAttribute("ext", "voice-v1 video-v1 camera-v1"); // TODO Send some capabilities! Avoid 'ext'
		// TODO calculate hash, use the hash under "ver", and set "hash" to "sha-1"
		xml.appendChild(cnode);
	}

	this.appendFeaturesToXML = function(packet, xml, ext)
	{

		if(!ext)
			ext = "";

		var ftrs;
		if(ext == "" || ext == this.ver)
			ftrs = this.features;
		else
			ftrs = this.featuresExt[ext];

		console.warn("TRYING TO GET EXT " + ext);
		if(ftrs)
		{

			// always add identity
			//<identity category='client' type='pc' name='Z-XMPP'/>
			
			var idnode = packet.xml.createElement("identity");
			idnode.setAttribute("category", "client");
			idnode.setAttribute("type", "pc");
			idnode.setAttribute("name", "Z-XMPP");
			xml.appendChild(idnode);

			// then add features
			/*for(var f in ftrs) // TODO whoops, where do we get feature namespaces?
			{
				
			}*/
			
			// FIXME stub!
			// FIXME we're faking jingle support
			// the only one we truly support in this list is disco#info
			var ftrnode;
		       
			if(ext=="" || ext == this.ver)
			{
				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "urn:xmpp:jingle:1");
				xml.appendChild(ftrnode);

				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "urn:xmpp:jingle:transports:ice-udp:1");
				xml.appendChild(ftrnode);

				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "urn:xmpp:jingle:apps:rtp:1");
				xml.appendChild(ftrnode);

				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "urn:xmpp:jingle:apps:rtp:audio");
				xml.appendChild(ftrnode);

				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "http://jabber.org/protocol/disco#info");
				xml.appendChild(ftrnode);
			}
			else if(ext == "voice-v1")
			{
				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "http://www.google.com/xmpp/protocol/voice/v1");
				xml.appendChild(ftrnode);
			}
			else if(ext == "video-v1")
			{
				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "http://www.google.com/xmpp/protocol/video/v1");
				xml.appendChild(ftrnode);
			}
			else if(ext == "camera-v1")
			{
				ftrnode = packet.xml.createElement("feature");
				ftrnode.setAttribute("var", "http://www.google.com/xmpp/protocol/camera/v1");
				xml.appendChild(ftrnode);
			}
			else
			{
				return false;
			}

			console.log("SENDING for EXT: " + ext);
			return true;
		}
		else
		{
			// notify the parent that something went wrong
			// we should not add anything into "xml" in case we report failure
			return false;
		}

		return false;
	}


	this.unpackExt = function(extdest)
	{
		if(!this.ext) return;
		var exts = this.ext.split(" ");
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var needsSending = false;
		for(var extId in exts)
		{
			var ext = exts[extId];
			if(extdest[ext])
			{
				var feature = extdest[ext];
				this.featuresExt[feature] = true;
				continue; // no need to request, we fetched from cache
			}
			
			var iq = new this.zxmpp.stanzaIq(this.zxmpp);
			iq.appendIqToPacket(packet, "query", "get", this.ownerJid);
			iq.appendQueryToPacket(packet, "http://jabber.org/protocol/disco#info");

			iq.query.setAttribute("node", this.node + "#" + ext);
			iq.inquiringExt = ext;
			iq.extDest = extdest;
				
			needsSending = true;
		}
		
		if(needsSending)
			packet.send("poll");
	}

	this.toJSON = function(key)
	{
		oldzxmpp = this.zxmpp;
		delete this.zxmpp;

		var ret = oldzxmpp.util.cloneObject(this);

		this.zxmpp = oldzxmpp;

		return ret;
	}

};

