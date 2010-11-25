/* 
 * Z-XMPP
 * A Javascript XMPP client.
 *
 * (c) 2010 Matija Folnovic
 * (c) 2010 Ivan Vucica
 * License is located in the LICENSE file
 * in Z-XMPP distribution/repository.
 * Use not complying to those terms is a
 * violation of various national and
 * international copyright laws.
 */

zxmppClass.prototype.ui = function() {
	this.bar = undefined,
	this.userlist = undefined,
	this.backend = undefined;

	this.inject = function(where) {
		this.bar = $('<div class="zxmpp_bar"><img style="display:none;" src="http://ivan.vucica.net/zxmpp/trackme.php" width="1" height="1"></div>').appendTo(where);
		this.bar.delegate('.zxmpp_title', 'click', this.changeWindowStatus);
		this.userlist = this.openWindow('Online', '_roster');
		/*
		this.openWindow('bok');
		this.rosterAdded('matija');
		this.rosterAdded('ivucica');
		this.rosterAdded('perica');
		this.rosterAdded('jeej');
		*/
		this.adjustWindows();
	}

	this.openWindow = function(title, id) {
		return $('<div class="zxmpp_window" id="zxmpp_window_' + id + '"><div class="zxmpp_content"></div><div class="zxmpp_title"><div>' + title + '</div></div></div>').appendTo(this.bar);
	}

	this.changeWindowStatus = function() {
		$('.zxmpp_content', $(this).parent()).toggle();
	}

	this.adjustWindows = function() {
		var width = 0;

		this.bar.children('div').each(function(i,window) {
			var window = $(window);
			window.css('right', width + 'px').children('*').width(window.width());
			width += window.width();
		});
	}

	this.rosterAdded = function(jid, icon, display, status) {
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		if(!status) 
			status = "";
		this.userlist.children('.zxmpp_content').append('<div id="zxmpp_roster_' + safejid + '" class="user' + safejid + ' zxmpp_user zxmpp_status' + icon + '">' + display + '<div class="zxmpp_statustext">' + status + '</div></div>');
		document.getElementById("zxmpp_roster_" + safejid).jid = jid; // fixme dont use id; use jquery and class='user'+safejid
		document.getElementById("zxmpp_roster_" + safejid).display = display; // fixme dont use id; use jquery and class='user'+safejid
		console.log("==> ROSTERADDED: " + jid + ", icon=" + icon + ", display=" + display + ", status=" + status);
        	this.userlist.delegate('.user' + safejid, 'click', this.userClick);
	}

	this.rosterRemoved = function(jid) {
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		this.userlist.find('.zxmpp_content > .user' + safejid).remove();
	}

	this.presenceUpdate = function(jid, icon, display, status)
	{
		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');
		var entries = this.userlist.find('.zxmpp_content > .user' + safejid);
		if(!status)
			status = "";
		
		entries.each(function(i,entry) {
			var display_ = display;
			if(!display_)
				display_ = entry.display;	
			entry.className="zxmpp_user zxmpp_status" + icon + " user" + safejid;
			entry.innerHTML=display + '<div class="zxmpp_statustext">' + status + '</div>';
		});

	}

	this.showMessage = function(jid, txt) {
		// FIXME dont use document.getElementById

		var barejid = jid.split("/")[0];
		var safejid = barejid.replace(/[^a-zA-Z 0-9]+/g,'');
		
		this.messageWindow(barejid); // FIXME get roster item from backend, and get display name
		//$('#zxmpp_window_msg_' + safejid + ' > input').remove();
		
		var msgcontainer = document.getElementById("zxmpp_window_msg_" + safejid).firstChild.firstChild
		msgcontainer.innerHTML += 
			'<div class="zxmpp_message_in">' + txt + '</div>';
		msgcontainer.scrollTop = msgcontainer.scrollHeight;
			/*
		$('#zxmpp_window_msg_' + safejid).append('<div class="zxmpp_message_in">other: ' + txt + '</div>');
		$('#zxmpp_window_msg_' + safejid).append('<input/>');
		*/
	}

	this.escapedHTML = function(txt) {
		// FIXME add better html escaping
		return txt.replace(/&/g, "&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
	}
	this.messageReceived = function(from, body) {
		this.showMessage(from, 'other: ' + this.escapedHTML(body));
	}

	this.userClick = function(event) {
		
		var jid = this.jid;
		var display = this.display;
		
		zxmppui.messageWindow(jid, display);//FIXME dont use zxmppui
	}
	this.messageWindow = function(jid, display) {

		// FIXME we reference zxmppui because "this" might not be an instance of zxmppui

		var safejid = jid.replace(/[^a-zA-Z 0-9]+/g,'');

		if(!display)
			display = jid;		
		console.log("GETTING WINDOW FOR " + jid);

		// FIXME use jquery, not document.getElementById
		var msgwindow = document.getElementById("zxmpp_window_msg_" + safejid);
		if(msgwindow)
		{
		//	return msgwindow;
			return;
		}
		console.log("Opening that window: " + jid + " (" + safejid + ")");
		var msgwindowjq = zxmppui.openWindow(display, "msg_" + safejid); 

		msgwindowjq.children('.zxmpp_content').append('<div class="zxmpp_content_msg"/>');
		msgwindowjq.children('.zxmpp_content').append('<input onkeypress="zxmppui_handlekeydown(event);" id="zxmpp_input_msg_' + safejid + '"/>');
		
		document.getElementById("zxmpp_input_msg_" + safejid).jid = jid;

		zxmppui.adjustWindows();

//		return document.getElementById("zxmpp_window_msg_" + safejid);
	}
	


};

function zxmppui_handlekeydown(event)
{
	if(event.which == 13)
	{
		// FIXME dont use zxmppui
		zxmppui.backend.sendMessage(event.target.jid, event.target.value);
		zxmppui.showMessage(event.target.jid, 'you: ' + zxmppui.escapedHTML(event.target.value)); 
		event.target.value = "";
	}
}
