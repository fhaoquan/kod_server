"use strict"

var crc = require('crc')

module.exports.dispatch = function(servers) {
	var index = (Math.random() * servers.length) << 0
	return servers[index]
}