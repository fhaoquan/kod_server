"use strict"

/**
 * Created by modun on 14-8-9.
 */

var Promise = require("bluebird")
var _ = require("underscore")

var LogService = require("../../services/logService")
var ErrorUtils = require("../../utils/errorUtils")
var Consts = require("../../consts/consts")

var Player = require("../../domains/player")
var Alliance = require("../../domains/alliance")
var Device = require("../../domains/device")

var life = module.exports

life.beforeStartup = function(app, callback){
	var currentServer = app.getServerFromConfig(app.getServerId())
	app.set("logicServerId", currentServer.id)
	var cacheServerIds = [];
	var servers = app.getServersFromConfig()
	_.each(servers, function(server, id){
		if(_.isEqual(server.serverType, "chat")){
			app.set("chatServerId", id)
		}else if(_.isEqual(server.serverType, "rank")){
			app.set("rankServerId", id)
		}else if(_.isEqual(server.serverType, "gate")){
			app.set("gateServerId", id)
		}else if(_.isEqual(server.serverType, 'cache')){
			cacheServerIds.push(id);
		}
	})
	app.set('cacheServerIds', cacheServerIds);

	app.set("logService", new LogService(app))

	app.set("Device", Promise.promisifyAll(Device))
	app.set("Player", Promise.promisifyAll(Player))
	app.set("Alliance", Promise.promisifyAll(Alliance))

	var request = function(session, api, params){
		var cacheServerId = session.get('cacheServerId');
		return Promise.fromCallback(function(callback){
			if(!app.getServerById(cacheServerId)) return callback(ErrorUtils.serverUnderMaintain());
			app.rpc.cache.cacheRemote.request.toServer(cacheServerId, api, params, function(e, resp){
				if(!!e) return callback(e);
				if(resp.code !== 200) return callback(ErrorUtils.createError(resp.code, resp.data, false));
				callback(null, resp.data);
			})
		})
	}
	app.set('request', request)
	callback()
}

life.afterStartup = function(app, callback){
	app.get("logService").onEvent("server started", {serverId:app.getServerId()})
	callback()
}

life.beforeShutdown = function(app, callback){
	app.get("logService").onEvent("server stoped", {serverId:app.getServerId()})
	setTimeout(callback, 1000)
}

life.afterStartAll = function(app){

}