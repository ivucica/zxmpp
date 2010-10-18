/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Ivan Vucica
 */

zxmppClass.prototype.stream = function (zxmpp)
{
	this.zxmpp = zxmpp;

	/* initialize request id */
	var maxRequestId=9007199254740991; // magic number from xep-0124, max number that some languages can accurately represent
	this.requestId = Math.floor(Math.random()*maxRequestId/2); // div2 so that we dont realistically reach max request id
	
	/* connections and packet queue */
	this.connectionsHold = new Array(); // these are "holding" connections, those that wait for response idly
	this.connectionsPoll = new Array(); // these are "polling" connections, those that are used to send stuff to server
	this.packetQueue = new Array(); // this queue holds packets that we tried to send while we had no free poll slot


	/* pre-baked request objects */
	this.connectionsHold.push(new XMLHttpRequest());
	this.connectionsPoll.push(new XMLHttpRequest(), new XMLHttpRequest());

	/* set of unique ids so far */
	this.uniqueIds = {};
	
	/* keys prepared for use, as per 15.x of XEP-0124 */
	this.keys = [];
	
	/* in case all poll connections are currently talkin',
	   add the packet to queue */
	this.pollPacketQueue = [];
	
	/* supported stream:features */
	this.features = {};
	
	/* state tracking variables */
	this.hasSentAuth = false;
	this.authSuccess = undefined;
	this.hasSentRestart = false;
	this.hasSentBind = false;
	this.hasSentSessionRequest = false;
	this.hasSentInitialPresence = false;

	/* state funcs */
	this.uniqueId = function(idType)
	{
		// return a unique id with type "idType"
		
		var id = 1;
		while(this.uniqueIds["zxmpp" + idType + '_' + id]) // as long as array element is not undefined
		{
			id++;
		}
		this.uniqueIds["zxmpp" + idType + "_" + id]=true;
		return "zxmpp" + idType + "_" + id;
	}
	
	
	/* connection/stream functions */
	this.establish = function()
	{
		var packet = new this.zxmpp.packet(this.zxmpp);
		var body = packet.xml_body;
		
		body.setAttribute('ver','1.6');
		body.setAttribute('wait','120');
		body.setAttribute('xmpp:version','1.0');
		body.setAttribute('hold','1');
		body.setAttribute('secure','false');
		body.setAttribute('to',this.zxmpp.cfg['server']);
		body.setAttribute('route',this.zxmpp.cfg['server'] + ':5222');

		packet.send();
	}
	
	this.assignRID = function()
	{
		return (this.requestId++)-1;
	}

	this.assignKey = function()
	{
		// assign a key, as described in 15.x in XEP-0124
		// if we're out of keys, then also generate a new base key
		
		// add a key, if available
		var ret = new Object();
		if(this.keys.length>0)
		{
			ret.key = this.keys.pop();
		}
	
		// if we don't have more keys left...
		if(this.keys.length<=1)
		{
			this.genKeys();
			ret.newKey = this.keys.pop();
		}
		
		return ret;
	}
	
	this.findFreeConnection = function(send_style)
	{
		var availableConn = false;

		var connection_pool;
		switch(send_style)
		{
			default:
			case "poll":
			connection_pool = this.connectionsPoll;
			break;
			
			case "hold":
			connection_pool = this.connectionsHold;
			break;
		}
		
		for(var i in connection_pool)
		{
			var conn = connection_pool[i];
			if(conn.readyState == 0)
			{
				//console.log("free slot found at " + i);
				availableConn = conn;
				availableConn.connindex = i;
				availableConn.conntype = send_style;
				availableConn.connzxmpp = this.zxmpp;
				break;
			}
			//console.log("searching over " + i);
		}
		//console.log("...but did not find empty slot");
		return availableConn;

	}
	
	this.transmitPacket = function(msg,send_style)
	{
		// send "msg" (string) using "send_style"-type
		// connection (either "hold" or "poll", default hold)
		
		// in case of poll message and no available connection,
		// queues the message
		
		
		
		if(!send_style) send_style = "poll";
		
		
		/*
		console.log("============ TRANSMIT (" + send_style + ") ============");
		console.log(msg);
		console.log("=======================================");		
		*/
		
		var conn = this.findFreeConnection(send_style);
		
		
		if(conn && (send_style=="hold" || (send_style == "poll" && this.pollPacketQueue.length == 0)))
		{
			// there is an available hold or poll connection slot

			conn.open("POST", this.zxmpp.cfg["bind-url"]);
 			conn.setRequestHeader("Content-type","text/xml; charset=utf-8");
			conn.setRequestHeader("X-ZXMPPType",send_style);
			conn.onreadystatechange = this.zxmpp.stream.handleConnectionStateChange;
			conn.send(msg);

		}
		else if (send_style == "poll")
		{
			// there was no available poll connection slot
			this.pollPacketQueue.push(msg);
			console.log("zxmpp::Stream::transmitPacket(): Sending on poll connection while poll queue exists. To keep ordering, added outgoing msg to packet queue and tried dispatching poll queue");
			this.tryEmptyingPollQueue();
		}
		else if (send_style == "hold")
		{
			console.warn("zxmpp::Stream::transmitPacket(): Tried to send a packet on a hold connection, but hold connection is unavailable. Packet dropped.")
		}
		else
		{
			console.error("zxmpp::Stream::transmitPacket(): Unhandled case while handling send_style " + send_style);
		}
	
		

	}

	this.tryEmptyingPollQueue = function()
	{
		while(this.pollPacketQueue.length && this.findFreeConnection("poll"))
		{
			// grab a packet that waits longest
			var packet = this.pollPacketQueue.shift();
			
			this.transmitPacket(packet, "poll");
		}

	}
	
	this.genKeys = function()
	{
		// implementation of 15.x in XEP-0124
		// generate 1000-1500 sha-1 keys, sufficient for 1000-1500
		// messages
		var n = Math.floor(Math.random()*500)+1000;
		var base_key = this.zxmpp.util.SHA1(Math.floor(Math.random()*1234567).toString());
		this.keys.push(base_key);
		for(var i = 0; i < n; i++)
		{
			this.keys.push(this.zxmpp.util.SHA1(this.keys[i]));
		}

	}

	this.handleConnectionStateChange = function()
	{
		
		if(typeof this.readyState == "undefined")
		{
			console.error("zxmppClass::Stream::handleConnectionStateChange(): 'this' is not XMLHttpRequest: " + typeof(this));
			return;
		}
		
		
		// for readability, introduce "conn" so the 
		// reader does not mix it up with stream's 'this'
		var conn = this;
		
		// if not done, don't continue
		if(conn.readyState != 4) 
		{
			return;
		}

		// clean connection slot, handle connection, try pushing stuff
		if(conn.conntype == "hold")
		{
			conn.connzxmpp.stream.connectionsHold[conn.connindex] = new XMLHttpRequest();
			conn.connzxmpp.stream.handleConnection(conn);	
		}
		else
		{
			conn.connzxmpp.stream.connectionsPoll[conn.connindex] = new XMLHttpRequest();
			conn.connzxmpp.stream.handleConnection(conn);
			conn.connzxmpp.stream.tryEmptyingPollQueue();
		}
		
	}
	
	this.handleConnection = function(conn)
	{
		var packet = new this.zxmpp.packet(this.zxmpp);
		packet.parseXML(conn.responseXML);
		
		if(!this.hasSentAuth)
		{
			// FIXME design an auth class,
			//       and then call this.auth.doStep();
			//       this will allow multistep non-PLAIN
			//       auth such as SCRAM-SHA-1
			
			if(this.zxmpp.stream.features["urn:ietf:params:xml:ns:xmpp-sasl"] && 
			this.zxmpp.stream.features["urn:ietf:params:xml:ns:xmpp-sasl"]["mechanisms"]["PLAIN"])
			{
				this.sendPlainAuth("poll");
			}
			else
			{
				console.error("zxmpp::stream::handleConnection(): plain authentication mechanism unsupported. giving up");
			}
			
		}
		else if(this.authSuccess && !this.hasSentRestart) // success is not false and not undefined
		{
			this.sendXmppRestart();
		}
		else if(this.hasSentRestart && !this.hasSentBind)
		{
			this.sendBindRequest();
		}
		else if(this.hasSentBind && !this.hasSentSessionRequest)
		{
			this.sendSessionRequest();
		}
		else if(this.hasSentSessionRequest && this.zxmpp.fullJid && !this.hasSentInitialPresence)
		{
			// send initial presence
			this.sendCurrentPresence();
			// also request roster
			// TODO check if server supports roster!
			// we need to add caps parsing for that first, though
			this.sendIqQuery("jabber:iq:roster");
			
			this.hasSentInitialPresence = true;
		}
		else if(this.hasSentInitialPresence && this.findFreeConnection("hold")) // if we haven't held yet, and we have a free holding slot...
		{
			this.sendIdle("hold");
		}
	}
	
	this.sendIdle = function(send_style)
	{
		// sends empty packet
		// for example, on "hold" connections
		var packet = new this.zxmpp.packet(this.zxmpp);
		packet.send(send_style);
	}
	
	this.sendPlainAuth = function(send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		// send authorization
		var packet = new this.zxmpp.packet(this.zxmpp);
		
		var authnode = packet.xml.createElementNS("urn:ietf:params:xml:ns:xmpp-sasl", "auth");
		authnode.setAttribute("mechanism", "PLAIN");
		packet.xml_body.appendChild(authnode);

		// create child text node
		var authnode_text = packet.xml.createTextNode(
			this.zxmpp.util.encode64(
				this.zxmpp.bareJid + "\0" + 
				this.zxmpp.username + "\0" + 
				this.zxmpp.password
			));
		authnode.appendChild(authnode_text);

		this.hasSentAuth=true;
		packet.send(send_style);
	}

	this.sendXmppRestart = function(send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		// send xmpp:restart request
		var packet = new this.zxmpp.packet(this.zxmpp);
		packet.xml_body.setAttribute("xmpp:restart", "true"); 

		this.hasSentRestart=true;
		packet.send(send_style);
	}
	
	this.sendBindRequest = function(send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		// send binding request
		// form: <iq type="set"><bind><resource>name</resource></bind></iq>
		if(!(this.zxmpp.stream.features["urn:ietf:params:xml:ns:xmpp-bind"]))
		{
			console.error("zxmpp::stream::sendBindRequest(): Server does not support binding. Aborting");
			return;
		}
		var packet = new this.zxmpp.packet(this.zxmpp);
		var iq = new this.zxmpp.stanzaIq(this.zxmpp);
		iq.appendIqToPacket(packet, "bind", "set", this.zxmpp.cfg["server"]);
		iq.appendBindToPacket(packet, "Z-XMPP");
		
		this.hasSentBind=true;
		packet.send(send_style);
		
	}
	
	this.sendSessionRequest = function(send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		// send session request
		// form: <iq type="set"><session/></iq>
		if(!(this.zxmpp.stream.features["urn:ietf:params:xml:ns:xmpp-session"]))
		{
			console.error("zxmpp::stream::sendSessionRequest(): Server does not support session. Aborting");
			return;
		}

		var packet = new this.zxmpp.packet(this.zxmpp);
		var iq = new this.zxmpp.stanzaIq(this.zxmpp);
		iq.appendIqToPacket(packet, "session", "set", this.zxmpp.cfg["server"]);
		iq.appendSessionToPacket(packet);
		
		this.hasSentSessionRequest=true;
		packet.send(send_style);

	}
	
	this.sendCurrentPresence = function(send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		// TODO server must support presence capability!
		// check if it does.
		// but, we dont have caps parsing yet
		var packet = new this.zxmpp.packet(this.zxmpp);
		var presence = new this.zxmpp.stanzaPresence(this.zxmpp);
		presence.appendToPacket(packet, this.zxmpp.fullJid, false, "available", "Using Z-XMPP", 1);
		
		this.hasSentInitialPresence = true;
		packet.send(send_style);
		
	}
	
	
	this.sendIqQuery = function(namespace, send_style)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var iq = new this.zxmpp.stanzaIq(this.zxmpp);
		iq.appendIqToPacket(packet, "query", "set", this.zxmpp.cfg["server"]);

		iq.appendQueryToPacket(packet, namespace);
		
		packet.send(send_style);
	}
	
	// some more initialization
	this.genKeys();

}