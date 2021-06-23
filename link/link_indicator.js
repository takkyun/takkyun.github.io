// link_indicator.js
// == written by Takuya Otani <takuya.otani@gmail.com> ===
// == Copyright (C) 2006 SimpleBoxes/SerendipityNZ Ltd. ==
/*
	Copyright (C) 2006 Takuya Otani/SimpleBoxes - http://serennz.cool.ne.jp/sb/
	Copyright (C) 2006 SerendipityNZ - http://serennz.cool.ne.jp/snz/
	
	This script is licensed under the Creative Commons Attribution 2.5 License
	http://creativecommons.org/licenses/by/2.5/
	
	basically, do anything you want, just leave my name and link.
*/
// === utilities ===
function addEvent(object, type, handler) {
	if (object.addEventListener) {
		object.addEventListener(type, handler, false);
	} else if (object.attachEvent) {
		object.attachEvent(['on',type].join(''),handler);
	} else {
		object[['on',type].join('')] = handler;
	}
}
function getEvent(evt) {
	return (evt) ? evt : ((window.event) ? window.event : null);
}
function WindowSize() { // window size object
	this.w = 0;
	this.h = 0;
	return this.update();
}
WindowSize.prototype.update = function() {
	var d = document;
	this.w = 
	  (window.innerWidth) ? window.innerWidth
	: (d.documentElement && d.documentElement.clientWidth) ? d.documentElement.clientWidth
	: d.body.clientWidth;
	this.h = 
	  (window.innerHeight) ? window.innerHeight
	: (d.documentElement && d.documentElement.clientHeight) ? d.documentElement.clientHeight
	: d.body.clientHeight;
	return this;
};
function PageSize() { // page size object
	this.win = new WindowSize();
	this.w = 0;
	this.h = 0;
	return this.update();
}
PageSize.prototype.update = function() {
	var d = document;
	this.w = 
	  (window.innerWidth && window.scrollMaxX) ? window.innerWidth + window.scrollMaxX
	: (d.body.scrollWidth > d.body.offsetWidth) ? d.body.scrollWidth
	: d.body.offsetWidt;
	this.h = 
	  (window.innerHeight && window.scrollMaxY) ? window.innerHeight + window.scrollMaxY
	: (d.body.scrollHeight > d.body.offsetHeight) ? d.body.scrollHeight
	: d.body.offsetHeight;
	this.win.update();
	if (this.w < this.win.w) this.w = this.win.w;
	if (this.h < this.win.h) this.h = this.win.h;
	return this;
};
function PagePos() { // page position object
	this.x = 0;
	this.y = 0;
	return this.update();
}
PagePos.prototype.update = function()
{
	var d = document;
	this.x =
	  (window.pageXOffset) ? window.pageXOffset
	: (d.documentElement && d.documentElement.scrollLeft) ? d.documentElement.scrollLeft
	: (d.body) ? d.body.scrollLeft
	: 0;
	this.y =
	  (window.pageYOffset) ? window.pageYOffset
	: (d.documentElement && d.documentElement.scrollTop) ? d.documentElement.scrollTop
	: (d.body) ? d.body.scrollTop
	: 0;
	return this;
};
function UserAgent() { // user agent information
	var ua = navigator.userAgent;
	this.isWinIE = this.isMacIE = false;
	this.isGecko  = ua.match(/Gecko\//);
	this.isSafari = ua.match(/AppleWebKit/);
	this.isOpera  = window.opera;
	if (document.all && !this.isGecko && !this.isSafari && !this.isOpera) {
		this.isWinIE = ua.match(/Win/);
		this.isMacIE = ua.match(/Mac/);
		this.isNewIE = (ua.match(/MSIE 5\.5/) || ua.match(/MSIE 6\.0/));
	}
	this.isCompat = true; // true means quirks mode.
	if (document.compatMode) this.isCompat = (document.compatMode != 'CSS1Compat')
	return this;
}
// === indicator ===
function LinkIndicator(option) {
	var self = this;
	self.borderWidth = (option.borderWidth) ? option.borderWidth : '1px';
	self._img = null;
	self._box = null;
	self._pos = new PagePos();
	self._ua  = new UserAgent();
	self._page = new PageSize();
	self._base = self._init_path(window.location);
	return self._init(option);
}
LinkIndicator.prototype = {
	_init : function(option)
	{
		var self = this;
		var d = document;
		if (!d.getElementsByTagName) return;
		var links = d.getElementsByTagName("a");
		for (var i=0;i<links.length;i++) {
			var href = links[i].getAttribute("href");
			if (!href) continue;
			var elem = {inner:null,target:null};
			var href = links[i].getAttribute('href');
			var targ = links[i].getAttribute('target');
			if (href.match(/(.*)\#(.+)/)) {
				var check = RegExp.$1;
				var name = RegExp.$2;
				if (check.length == 0 || check == self._base) {
					if (d.getElementById(name))
						elem.inner = d.getElementById(name);
					else if (d.getElementsByName(name))
						elem.inner = d.getElementsByName(name)[0];
					if (links[i] == elem.inner) elem.inner = null;
				}
			}
			if (targ && targ != '_self' && targ != '_parent' && targ != '_top') elem.target = targ;
			if (elem.inner || elem.target) {
				addEvent(links[i],"mouseover",self._handler(links[i],elem));
				addEvent(links[i],"focus",self._handler(links[i],elem));
				addEvent(links[i],"mouseout",function() { self._reset() } );
				addEvent(links[i],"blur",function() { self._reset() } );
				addEvent(links[i],"mousemove",function(event) { self._move(event) } );
			}
		} // end of for (var i=0;i<links.length;i++)
		self._init_parts(option);
		return self;
	},
	_init_path : function(l)
	{
		var self = this;
		var path = [l.protocol,l.host].join('//');
		path = [path,l.pathname].join('');
		return path;
	},
	_init_parts : function(option)
	{
		var self = this;
		var d = document;
		var body = d.getElementsByTagName("body")[0];
		var box = d.createElement('div');
		box.id = 'indicator-line';
		with (box.style) {
			display = 'none';
			position = 'absolute';
			borderWidth = '0px';
			zIndex = 100;
		}
		if (option.pointerImg) {
			var pointer = d.createElement('img');
			pointer.style.position = 'absolute';
			pointer.style.zIndex = 100;
			pointer.src = option.pointerImg;
			box.appendChild(pointer);
		}
		body.appendChild(box);
		self._box = box;
		if (option.linkToBlank) {
			var img = new Image;
			img.onload = function() {
				var marker = d.createElement('div');
				var mark_img = d.createElement('img');
				mark_img.src = img.src;
				marker.id = 'indicator-symbol';
				with (marker.style) {
					display = 'none';
					position = 'absolute';
					width = [img.width,'px'].join('');
					height = [img.height,'px'].join('');
					zIndex = 100;
				}
				marker.appendChild(mark_img);
				body.appendChild(marker);
				self._img = marker;
			};
			img.src = option.linkToBlank;
		}
	},
	_handler : function(link,option)
	{
		var self = this;
		return function(event) { self._indicate(link,option,event); };
	},
	_reset : function()
	{
		var self = this;
		if (self._img && self._img.style) self._img.style.display = 'none';
		if (self._box && self._box.style) self._box.style.display = 'none';
	},
	_cursor_position : function(event)
	{
		var self = this;
		var pos = {
			x: event.clientX || event.offsetX || event.x,
			y: event.clientY || event.offsetY || event.y
		}
		if (self._ua.isGecko) {
			self._pos.update();
			pos.x += self._pos.x;
			pos.y += self._pos.y;
		}
		return pos;
	},
	_move : function(event)
	{
		var self = this;
		var pos  = self._cursor_position(getEvent(event));
		if (self._img && self._img.style.display != 'none') {
			self._img.style.left = [pos.x + 10,'px'].join('');
			self._img.style.top  = [pos.y + 4,'px'].join('');
		}
	},
	_object_position : function(obj)
	{
		var self = this;
		var pos = {x:obj.offsetLeft, y:obj.offsetTop};
		if (self._ua.isNewIE) return pos;
		var parent = obj.offsetParent;
		while (parent) {
			pos.x += parent.offsetLeft;
			pos.y += parent.offsetTop;
			parent = parent.offsetParent;
		}
		return pos;
	},
	_region : function(src,dest)
	{
		var self = this;
		var bgn = self._object_position(src);
		var end = self._object_position(dest);
		var min = {x:(bgn.x < end.x) ? bgn.x : end.x, y:(bgn.y < end.y) ? bgn.y : end.y};
		var max = {x:(bgn.x < end.x) ? end.x : bgn.x, y:(bgn.y < end.y) ? end.y : bgn.y};
		return {
			left:min.x + 5,
			top:min.y + 5,
			width:(max.x - min.x) || 1,
			height:(max.y - min.y) || 1,
			vertical:(bgn.x < end.x) ? 'borderRightWidth' : 'borderLeftWidth',
			horizontal:(bgn.y < end.y) ? 'borderTopWidth' : 'borderBottomWidth',
			targetX:(bgn.x < end.x) ? (max.x - min.x) - 8 : -8,
			targetY:(bgn.y < end.y) ? (max.y - min.y) - 8 : -8
		};
	},
	_indicate : function(link,option,event)
	{
		var self = this;
		var pos  = self._cursor_position(getEvent(event));
 		if (self._img && option.target) {
			self._img.style.display = 'block';
			self._img.style.left = [pos.x + 10,'px'].join('');
			self._img.style.top  = [pos.y + 4,'px'].join('');
		}
		if (option.inner && link.offsetLeft && self._box) {
			var region = self._region(link,option.inner);
			with (self._box.style) {
				display = 'block';
				borderWidth = '0px';
				left = [region.left,'px'].join('');
				top = [region.top,'px'].join('');
				width = [region.width,'px'].join('');
				height = [region.height,'px'].join('');
			}
			self._box.style[region.vertical] = self.borderWidth;
			self._box.style[region.horizontal] = self.borderWidth;
			if (self._box.firstChild && self._box.firstChild.style) {
				self._box.firstChild.style.left = [region.targetX,'px'].join('');
				self._box.firstChild.style.top = [region.targetY,'px'].join('');
			}
		}
	}
};
// === main ===
addEvent(window,"load",function() {
	new LinkIndicator({
		// linkToBlank:'../assets/images/addwin.png',
		pointerImg:'../assets/images/pointer.png',
		borderWidth:'2px'
	});
});
