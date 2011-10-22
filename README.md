# Z-XMPP #

For more info, visit <http://ivan.vucica.net/zxmpp/>.

## What is it? ##
This is an implementation of an XMPP client in Javascript. It uses BOSH concept 
of HTTP binding as defined by XEP-0124 and XEP-0206. 

It is a semi-structured hack, assembled not so much as a planned effort by 
a Javascript expert; it's more of a thing that's here just to serve its purpose,
and that purpose is luckily for its internals to be pretty. So hacker: beware!

## Goal ##

Goal is to have a backend library for doing XMPP, and a separate GUI that will
allow attaching an overlay over existing webpage, as well as almost transparent
reconnection upon unloading the page and reloading it.

Another goal is to support major standards-based browsers: Safari, Chrome,
Opera, Firefox.

## Compatibility ##

It is expected that the client will cover at least XEP-0242: XMPP Client
Compliance 2009 Core Client profile. Of course, almost anything goes that
doesn't require additional socket connections (since they're a bit... tricky
to do in Javascript, you'll surely agree).

Z-XMPP has been tested with the following BOSH connection managers:

* [ejabberd](http://ejabberd.im/)'s connection manager
* [Prosody](http://prosody.im/)'s connection manager
* [Punjab](http://punjab.sourceforge.net/)

Z-XMPP has been tested with the following XMPP server software:

* [ejabberd](http://ejabberd.im/)
* [Prosody](http://prosody.im/)
* [Google Talk](http://talk.google.com/)
* [Facebook Chat](http://www.facebook.com/help/?page=1164)

### Version 1.0 ###

Following SASL authentication methods are partially or fully supported:

* PLAIN
* DIGEST-MD5

Following XEPs are partially or fully supported:

* XEP-0030: Service Discovery
* XEP-0054: vcard-temp
* XEP-0085: Chat State Notifications
* XEP-0092: Software Version
* XEP-0115: Entity Capabilities
* XEP-0124: Bidirectional-streams Over Synchronous HTTP (BOSH)
* XEP-0206: XMPP Over BOSH

There may be additional features supported, but not documented.

## License ##

Please read the [LICENSE](LICENSE) to see current use terms.

## Installation ##

To see how to set up `demo.php` to work, and to see how to add Z-XMPP to your
web site, see [README](README.md).

These instructions can, of course, be improved, and the author will be
happy to answer your questions on how to get Z-XMPP to connect to your
XMPP server on your web site.

## Contributing ##

Patches and good natured criticism can be directed to <zxmpp@vucica.net>.

- - -

Copyright 2010-2011 Ivan Vučica

