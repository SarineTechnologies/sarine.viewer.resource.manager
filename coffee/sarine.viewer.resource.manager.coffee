###!
sarine.viewer.resource.manager - v0.0.10 -  Thursday, February 26th, 2015, 11:27:58 AM 
 The source code, name, and look and feel of the software are Copyright © 2015 Sarine Technologies Ltd. All Rights Reserved. You may not duplicate, copy, reuse, sell or otherwise exploit any portion of the code, content or visual design elements without express written permission from Sarine Technologies Ltd. The terms and conditions of the sarine.com website (http://sarine.com/terms-and-conditions/) apply to the access and use of this software.
###
class ResourceManager
	_instance = undefined
	_timeoutManager = undefined
	_imageManger = undefined
	constructor: ->
		console.log 'new singleton'
		_timeoutManager = new TimeoutManager()
		_imageManger = new ImageManger()


	@getInstance: ->
		if _instance is undefined
			_instance = new @()
		_instance

	class ImageManger

		constructor: () ->
			
		viewerImagesObj : {}
		loadImage : (src,viewer,defer) -> 
			_t = @
			if @viewerImagesObj[viewer.id] == undefined
				@viewerImagesObj[viewer.id] = {				
					capacity : viewer.downloadLimit || 1000,
					bag:[],
					threshhold:[],
					order : parseInt viewer.element.data("order")
				}
			defer = defer || $.Deferred()
			img = new Image()
			img.crossOrigin = "Anonymous"
			img.onload = (e) ->
				index = $.inArray(_t.viewerImagesObj[viewer.id].threshhold.filter((v)=> return v.src == e.target.src )[0],_t.viewerImagesObj[viewer.id].threshhold)
				obj = _t.viewerImagesObj[viewer.id].threshhold[index]
				popped = _t.viewerImagesObj[viewer.id].bag.shift()
				if popped
					popped.img.src = popped.src
					_t.viewerImagesObj[viewer.id].threshhold.push(popped)
				_t.viewerImagesObj[viewer.id].threshhold.splice index , 1
				obj.defer.resolve(e.target)
				
			if @viewerImagesObj[viewer.id].threshhold.length < @viewerImagesObj[viewer.id].capacity
				@viewerImagesObj[viewer.id].threshhold.push { defer:defer, src:src , img:img}
				img.src = src
			else
				@viewerImagesObj[viewer.id].bag.push  { defer:defer, src:src , img:img}
				
			img.onerror = (e) ->				  
				index = $.inArray(_t.viewerImagesObj[viewer.id].threshhold.filter((v)=> return v.src == e.target.src )[0],_t.viewerImagesObj[viewer.id].threshhold)
				obj = _t.viewerImagesObj[viewer.id].threshhold[index]
				if(e.target.src != viewer.callbackPic)
					_t.loadImage(viewer.callbackPic,viewer,defer)			
				else
					throw new Error('callbackPic not exist')
				
				
			# if the copacity is reach the bind to the defer.then(function) of the current downloading image
			defer

	# @ (this) is for the instance that request the loadImage			
	loadImage : (src)->  _imageManger.loadImage(src,@)

	class TimeoutManager
		constructor: () ->
			# ...
		funcArr = {}

		@add : (delay,defer,item)->
			obj = {
					defer : defer
					item : item
				}
			if(!funcArr[delay])
				setTimeout((delay)->
					temp = funcArr[delay]
					funcArr[delay] = undefined
					unique = $.unique(temp.map((v)->v.item.id))
					temp.forEach((i)->i.defer.resolve.apply(i.item))
				,delay,delay)
				funcArr[delay] = []
			if (funcArr[delay].filter((v)->v.item.id == obj.item.id)).length ==  0
				funcArr[delay].push obj


		
	
	setTimeout : (delay) ->
		defer = $.Deferred()
		TimeoutManager.add(delay,defer,@)
		defer

@ResourceManager = ResourceManager