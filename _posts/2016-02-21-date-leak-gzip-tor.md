---
layout: post
title: HTTP GZIP Compression remote date and time leak
categories: [security]
tags: [security, tor, privacy, hacking]
fullview: true
comments: true
---

### Hidden Services in TOR
***<a href="https://www.torproject.org/">Tor</a>*** is a service run by a network of volunteers to allow people to use internet anonymously. Normally tor is used to browse the web
without being tracked or identified.

One of the less known features of the tor service is the ability to provide what is known in tor as ***<a href="https://www.torproject.org/docs/hidden-services.html.en">hidden services</a>***.
Hidden services are basically servers that provide services through the tor network. When you think about tor the first thing you think of
is anonymous web browsing. However, for hacktivists and dissidents it is very useful not only to be able to browse the web without being identified,
but also providing web pages for people in a way that such webpages can not be tracked or shutdown easily.

<div style="text-align:center;margin:25px">
<img src="/assets/media/posts/torlogo.png" />
</div>

In the tor network there are thousands of 'hidden services' accessible only for people using the tor network, that provide access to forbidden information about very different topics.
Those sites have a hidden DNS address with the .onion tld, for example example.onion. This sites ending in .onion can not be tracked or shutdown, and the owner can not be identified.

One of the most complex things about setting up a hidden service, is configuring the web server in a way that doesn't leak information about the real IP address of the server, or the country location etc.
The more complex the site, the more difficult it becomes to setup a real hidden service that doesn't leak information in any way.

During the last years, the FBI has been able to identify and shutdown certain hidden services, using social engineering, information leaks and browser vulnerabilities. The last example is
***<a href="https://en.wikipedia.org/wiki/Silk_Road_(marketplace)">The Silk Road</a>***,
a well known black market hidden inside tor, used for selling drugs and similar stuff.

Of course, the administrators behind hidden services try its best to not leak any information about the physical location of the server providing the service, or any other information
that could leak to the identification of the owner of the hidden service.

### Leaking the timezone
The HTTP protocol allows the client to inform the server about its compression capabilities. If the client and server share support for a specific compression format, the server can decide to compress the http
response in order to save bandwitch and time. All major web server and browser support compression. The most common formats used for
***<a href="https://en.wikipedia.org/wiki/HTTP_compression">HTTP compression</a>*** are ***<a href="http://www.gzip.org/">gzip</a>*** and ***<a href="https://en.wikipedia.org/wiki/DEFLATE">DEFLATE</a>***.

Gzip is a compression format that allows relative fast data compression with decent compression ratios.

As a compression format, gzip specifies a data header to be included in the resulting compressed data, this header includes information about the compressed data, the operating system that compressed the data, and
most importantly: **the date when the data was compressed**.

The header is as follows, as you can see in ***<a href="http://www.forensicswiki.org/wiki/Gzip">Foreniscs Wiki</a>***:
<br/><br/>

| Offset  | Size | Value | Description |
| :-------------: | :-------------: | :-------------: | :-------------: |
| &nbsp;&nbsp;0&nbsp;&nbsp; | &nbsp;&nbsp;2&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;     0x1f 0x8b &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Magic number to idenitfy gzip streams |
| &nbsp;&nbsp;2&nbsp;&nbsp; | &nbsp;&nbsp;1&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Compression method |
| &nbsp;&nbsp;3&nbsp;&nbsp; | &nbsp;&nbsp;1&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Flags |
| &nbsp;&nbsp;4&nbsp;&nbsp; | &nbsp;&nbsp;4&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| **Compression Date** |
| &nbsp;&nbsp;8&nbsp;&nbsp; | &nbsp;&nbsp;1&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Compression flags |
| &nbsp;&nbsp;9&nbsp;&nbsp; | &nbsp;&nbsp;1&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| Operating system |

<br/><br/>
So, if this header is present in any gzip compressed data, we can make a gzip compressed request to any webserver, wait for the gzip compressed response, check if the bytes starts with 0x1f 0x8b, and check for
the compression date to know the exact date configured at the server that serves the page.

<div style="text-align:center;margin:25px">
<img src="/assets/media/posts/timezone.jpg" />
</div>

With normal webservers, this is only useful in a very limited scenarios, because the geopraphical position of the server is not hidden in any way, and can be known easily knowing the server IP address, that is not hidden at all.
However, in a **Hidden Service**, the information about the server timezone can be very useful to identify the possible countries where the server is running.

This, of course, **its NOT a TOR fault and its not a bug in the tor protocol** or anything like that, its just a obscure feature of the gzip format, available in the HTTP Protocol by default in most web servers.

The good news is that lots of webservers are preconfigured to fill the date field of the gzip header with '0's, maybe because of performance issues, who knows. After some research, I found that around 10%
of the webservers leak the remote date when compressing HTTP Responses with gzip.

For testing purposes, **instagram.com**, **reddit.com** and **bing.com** leak the remote date in the gzip encoded http response.

Of course, because of privacy concerns, I'm not going to provide information on wich hidden services are leaking the remote date.

### Proof Of Concept

I have developed a little php script that uses curl (command line) to get the remote server date if available in the gzip compressed HTTP Response. It will only work in web server that
allows for compression of HTTP Responses, and fills the 'date' field of the gzip header with the correct date instead of zeroes.

Examples of use:

```
user@localhost:~$ php time.php bing.com
The server that processed the request on: bing.com has local date set to:
Sunday 21st of February 2016 01:21:21 PM

user@localhost:~$ php time.php reddit.com
The server that processed the request on: reddit.com has local date set to:
Sunday 21st of February 2016 09:21:25 PM

user@localhost:~$ php time.php instagram.com
The server that processed the request on: instagram.com has local date set to:
Sunday 21st of February 2016 09:21:30 PM

user@localhost:~$
```

<br/>
The tool is available here:

***<a href="https://github.com/jcarlosn/gzip-http-time">https://github.com/jcarlosn/gzip-http-time</a>***



