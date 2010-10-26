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
	
	/* rememeber outgoing set and get iqs for which we
	   did not receive a result or error reply */
	this.iqsAwaitingReply = {};
	
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
		body.setAttribute('to',this.zxmpp.cfg['domain']);
		body.setAttribute('route',this.zxmpp.cfg['route']);

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
	this.freeConnections = function(send_style)
	{

		var availableConns = 0;

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
				availableConns ++;
			}
		}
		return availableConns;
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
				//console.log("free slot found at: " + i);
				availableConn = conn;
				availableConn.connindex = i;
				availableConn.conntype = send_style;
				availableConn.connzxmpp = this.zxmpp;
				return availableConn;
				break;
			}
			//console.log("searching passed: " + i);
		}
		//console.log("...but did not find empty slot");
		return false;
		
	}
	
	this.transmitPacket = function(packet,send_style,sending_from_queue)
	{
		// send "packet" (zxmpp.packet) using "send_style"-type
		// connection (either "hold" or "poll", default hold)
		
		// in case of poll message and no available connection,
		// queues the message
		
		
		
		if(!send_style) send_style = "poll";
		
		
		/*
		console.log("============ TRANSMIT (" + send_style + ") ============");
		console.log("(not finalized packet)");
		console.log(this.zxmpp.util.serializedXML(packet.xml));
		console.log("=======================================");		
		*/
		
		
		var conn = this.findFreeConnection(send_style);
		

/*	
		if(send_style=="poll")
		{
			if(conn && (this.pollPacketQueue.length == 0 || sending_from_queue))
			{
				conn.open("POST", this.zxmpp.cfg["bind-url"]);
 				conn.setRequestHeader("Content-type","text/xml; charset=utf-8");
				conn.setRequestHeader("X-ZXMPPType",send_style);
				conn.onreadystatechange = this.zxmpp.stream.handleConnectionStateChange;
				if(!conn.connoutgoing)
					conn.connoutgoing = packet.finalized();
				conn.send(conn.connoutgoing);
			}
			else
			{
				this.pollPacketQueue.push(packet);
				this.tryEmptyingPollQueue();
			}
		}
		else
		{
			if(conn)
			{
				conn.open("POST", this.zxmpp.cfg["bind-url"]);
 				conn.setRequestHeader("Content-type","text/xml; charset=utf-8");
				conn.setRequestHeader("X-ZXMPPType",send_style);
				conn.onreadystatechange = this.zxmpp.stream.handleConnectionStateChange;
				if(!conn.connoutgoing)
					conn.connoutgoing = packet.finalized();
				conn.send(conn.connoutgoing);
			}
			else
			{
				
			}
		}
*/		
		
//		return;


		var conn = this.findFreeConnection(send_style);
		
		if(conn) console.log("Sending " + send_style + " with pollqueue " + this.pollPacketQueue.length + ": " + this.zxmpp.util.serializedXML(packet.xml));

		
		if(conn && (send_style=="hold" || (send_style == "poll" && (this.pollPacketQueue.length == 0 ||sending_from_queue) )))
		{
			// there is an available hold or poll connection slot

			conn.open("POST", this.zxmpp.cfg["bind-url"]);
 			conn.setRequestHeader("Content-type","text/xml; charset=utf-8");
			conn.setRequestHeader("X-ZXMPPType",send_style);
			conn.onreadystatechange = this.zxmpp.stream.handleConnectionStateChange;
			if(!conn.connoutgoing)
				conn.connoutgoing = packet.finalized();
			conn.send(conn.connoutgoing);


			//if(this.hasSentInitialPresence && this.pollPacketQueue.length == 0 && send_style == "poll" && this.findFreeConnection("hold"))
			if(this.hasSentInitialPresence && this.freeConnections()>1)
				this.fillPollConnection();
				//this.sendIdle("hold");
			//console.log("WRITING " + conn.connoutgoing);

		}
		
		
		/*
		else if (send_style == "poll")
		{
			// there was no available poll connection slot
			// or, there was something in the queue
			console.log("zxmpp::Stream::transmitPacket(): Sending on poll connection while poll connections are taken, or poll queue exists: " + this.pollPacketQueue.length + ". To keep ordering, added outgoing msg to packet queue and tried dispatching poll queue");

			this.pollPacketQueue.push(packet);
			this.tryEmptyingPollQueue();
			
			if(this.pollPacketQueue.length == 0 && send_style == "poll" && this.findFreeConnection("hold"))
				this.sendIdle("hold");

			
		}
		else if (send_style == "hold")
		{
			console.warn("zxmpp::Stream::transmitPacket(): Tried to send a packet on a hold connection, but hold connection is unavailable. Packet dropped.")
		}
		else
		{
			console.error("zxmpp::Stream::transmitPacket(): Unhandled case while handling send_style " + send_style);
		}
		*/
		

	}

	this.tryEmptyingPollQueue = function()
	{
		while(this.pollPacketQueue.length && this.findFreeConnection("poll"))
		{
			// grab a packet that waits longest
			var packet = this.pollPacketQueue.shift();
			
			this.transmitPacket(packet, "poll", true);
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


	this.retryConn = function(conn)
	{
		// retry sending after timeout
		// also, only if poll queue is completely free.
		// otherwise, delay more
		console.log("this.retryConn");	
		/*if(conn.connzxmpp.stream.pollPacketQueue.length)
		{
			console.log("zxmpp retryConn delaying more");
			conn.connzxmpp.stream.tryEmptyingPollQueue();
			setTimeout(conn.connzxmpp.stream.retryConn, 1000, conn);
			return;
		}
		console.log("Yay");
*/
		conn2 = new XMLHttpRequest();
		conn2.open("POST", conn.connzxmpp.cfg["bind-url"]);
		conn2.setRequestHeader("Content-type","text/xml; charset=utf-8");
		conn2.setRequestHeader("X-ZXMPPType",conn.conntype);
		conn2.onreadystatechange = conn.connzxmpp.stream.handleConnectionStateChange;
		conn2.connoutgoing = conn.connoutgoing;
		conn2.connindex = conn.connindex;
		conn2.connzxmpp = conn.connzxmpp;
		conn2.conntype = conn.conntype;
		conn2.send(conn2.connoutgoing);
		
		if(conn2.conntype=="hold")
			conn.connzxmpp.stream.connectionsHold[conn2.connindex] = conn2;
		else
			conn.connzxmpp.stream.connectionsPoll[conn2.connindex] = conn2;
	}

	this.retriesUpon404 = 10; // how many times can we retry sending packet?

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
		
		// the connection failed?
		if(conn.status != 200)
		{
			switch(conn.status)
			{
				case 0:	
				// although this is probably due to page closing,
				// it could be also due to different disconnect
				// (such as computer going to standby, or unreliable
				// connection)
				case 502:
				// probably proxy timeout!
				console.log("Disconnect (HTTP status " + conn.status + ") - retrying");
				
				// retry as with 404!
				
				case 404:
				// TODO check if BOSH really specifies 404 upon out of order packet, or is this ejabberd specific behavior?		
				if(conn.connzxmpp.stream.retriesUpon404<0)
				{
					console.error("zxmppClass::Stream::handleConnectionStateChange(): Too many " + conn.status + " failures, giving up and terminating");
					conn.connzxmpp.stream.terminate();
	
					var code = "terminate/http-" + conn.status;
					var humanreadable = "Attempts to handle " + conn.status + " by reposting failed. The service does not exist or there were too many out of order packets";
					conn.connzxmpp.notifyConnectionTerminate(code, humanreadable);
					return;
				}
				
				conn.connzxmpp.stream.retriesUpon404--;
				console.warn("zxmppClass::Stream::handeConnectionStateChange(): http " + conn.status + " - out of order request? http abort? retrying");
				
//				conn.send(conn.connoutgoing);

				setTimeout(conn.connzxmpp.stream.retryConn, 600+Math.random()*100, conn);
				return;
				
				case 503:
				console.error("zxmppClass::Stream::handleConnectionStateChange(): service not running or overloaded: http " + conn.status + ", terminating connection");
				conn.connzxmpp.stream.terminate();

				var code = "terminate/http-" + conn.status;
				var humanreadable = "Service not running or overloaded.";
				conn.connzxmpp.notifyConnectionTerminate(code, humanreadable);
				return;
			
				case 500:
				window.open("data:text/html," + conn.responseText, "Name");
				default:
				console.error("zxmppClass::Stream::handleConnectionStateChange(): invalid http status " + conn.status + ", terminating connection");
				conn.connzxmpp.stream.terminate();

				var code = "terminate/http-" + conn.status;
				var humanreadable = "Unexpected HTTP status '" + conn.status + "'.";
				conn.connzxmpp.notifyConnectionTerminate(code, humanreadable);
				return;
				
			}
		}

		// success? reset 404 count
		this.retriesUpon404 = 10;
		console.log("Retries are reset");

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
		if(!packet.parseXML(conn.responseXML)) // packet not intended for further processing
		{
			return;
		}
		
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
			this.sendIqQuery("jabber:iq:roster", "get");//, this.zxmpp.bareJid);
			
			this.hasSentInitialPresence = true;
		}
		else if(this.hasSentInitialPresence && this.findFreeConnection("poll")/* && !this.pollPacketQueue.length*/) // if we haven't held yet, and we have a free holding slot, and nothing is waiting to poll...
		{
			this.fillPollConnection();
			//this.sendIdle("hold");
		}
	}
	this.fillPollConnection = function()
	{
		if(this.pollPacketQueue.length == 0 && this.freeConnections() > 1)
			this.sendIdle("poll");
		else if(this.pollPacketQueue.length)
			this.tryEmptyingPollQueue();
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
		
		iq.appendIqToPacket(packet, "bind", "set", this.zxmpp.cfg["domain"]);
		iq.appendBindToPacket(packet, "Z-XMPP" + Math.random() * 1000);
		
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
		iq.appendIqToPacket(packet, "session", "set", this.zxmpp.cfg["domain"]);
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
		
		// TODO send actual presence, not hardcoded stuff
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var presence = new this.zxmpp.stanzaPresence(this.zxmpp);
		presence.appendToPacket(packet, this.zxmpp.fullJid, false, "available", "Using Z-XMPP", 1);
		
		this.hasSentInitialPresence = true;
		packet.send(send_style);
		
	}
	
	
	this.sendIqQuery = function(namespace, type, destination, send_style, extra_query_attribs)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var iq = new this.zxmpp.stanzaIq(this.zxmpp);
		iq.appendIqToPacket(packet, "query", type, destination);

		iq.appendQueryToPacket(packet, namespace);
		
		if(extra_query_attribs)
		{
			for(var attrib in extra_query_attribs)
			{
				var val = extra_query_attribs[attrib];
				
				iq.query.setAttribute(attrib, val);
			}
		}
		packet.send(send_style);
		
		// in case caller wants to add something
		// more to the "remembered" reference to 
		// this zxmpp::stanzaIq, return it.
		return iq; 
	}


	this.sendMessage = function(send_style, from, to, type, body)
	{
		// FIXME move packet fillout to zxmpp_packet.js
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var message = new this.zxmpp.stanzaMessage(this.zxmpp);
		message.appendToPacket(packet, from, to, type, body);
		
		packet.send(send_style);
		
	}

	this.logoff = function()
	{
		// first send logoff "presence"
		
		var packet = new this.zxmpp.packet(this.zxmpp);
		var presence = new this.zxmpp.stanzaPresence(this.zxmpp);
		presence.appendToPacket(packet, this.zxmpp.fullJid, false, "unavailable", "Logging off Z-XMPP", 1);
		
		packet.xml_body.setAttribute("type","terminate");
		packet.send("poll");
		
		// then ...
		// TODO do nicer cleanup
		zxmppClass._STREAM=this;
		setTimeout(1, "zxmppClass._STREAM.terminate();");
	}
	
	this.terminate = function()
	{
		console.log("Finishing stream termination");
		for(var conn in this.connectionsHold)
		{
			conn.onreadystatechange = false;
			if(conn.abort)
				conn.abort();
		}
		for(var conn in this.connectionsPoll)
		{
			conn.onreadystatechange = false;
			if(conn.abort)
				conn.abort();
		}
		
		// reset pools
		this.connectionsHold = [new XMLHttpRequest()];
		this.connectionsPoll = [new XMLHttpRequest()]; //, new XMLHttpRequest];
		
		// clean queue
		this.pollPacketQueue = [];
	}
	

}
