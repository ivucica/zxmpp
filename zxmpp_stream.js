/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * DOCUMENTATION ON BOSH: http://xmpp.org/extensions/xep-0124.html 
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
		body.setAttribute('wait','60');
		body.setAttribute('xmlns:xmpp','urn:xmpp:xbosh');
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
		
		if(!send_style) send_style = "hold";
		
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
			this.pollPacketQueue.push(xml);
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
		// stub
		console.log("...tryEmptyingPollQueue");
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
			// zxmpp_do_dummy();
		}
		else
		{
			conn.connzxmpp.stream.connectionsPoll[conn.connindex] = new XMLHttpRequest();
			conn.connzxmpp.stream.handleConnection(conn);
			this.tryEmptyingPollQueue();
		}
		
	}
	
	this.handleConnection = function(conn)
	{
		var packet = new this.zxmpp.packet(this.zxmpp);
		packet.parseXML(conn.responseXML);
	}
	

	// some more initialization
	this.genKeys();

}