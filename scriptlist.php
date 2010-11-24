<?php

function zxmppGetZXMPPScripts()
{
	return array(
		'zxmpp_main.js',
		'zxmpp_util.js',
		'zxmpp_ui.js',
		'zxmpp_stream.js',
		'zxmpp_packet.js',
		'zxmpp_presence.js',
		'zxmpp_caps.js',
		'zxmpp_itemroster.js',

		'zxmpp_stanzaiq.js',
		'zxmpp_stanzapresence.js',
		'zxmpp_stanzastreamfeatures.js',
		'zxmpp_stanzasaslresult.js',
		'zxmpp_stanzamessage.js'
		);
}

function zxmppGetAllScripts()
{
	$scripts = zxmppGetZXMPPScripts();

	$scripts[] = 'jquery.min.js';
	$scripts[] = 'deepCopy.js';

	return $scripts;
}

function zxmppGetStylesheets()
{
	return array("application.css");
}
?>