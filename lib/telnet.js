var Promise = require('bluebird');
var telnet = require('telnet-client');
var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var openvpnEmitter = false;
var connection = false;

module.exports.destroy = function () {
    if (connection) {
        connection.removeAllListeners();
        connection.end();
        connection.destroy();
        connection = false;
    }
}

module.exports.connect = function (params) {
    establishConnection(params)
        .then(function () {
            openvpnEmitter.emit('connected');
        });

    return openvpnEmitter
}

module.exports.connectAndKill = function (params) {
    establishConnection(params)
        .then(disconnect);

    return openvpnEmitter;
}

module.exports.authorize = function (auth) {
    return execute(util.format('username "Auth" "%s"', auth.user))
        .then(function () {
            execute(util.format('password "Auth" "%s"', auth.pass));
        });
}

module.exports.disconnect = function () {
    return disconnect();
}

module.exports.cmd = function (cmd) {
    return execute(cmd);
}

function establishConnection(params) {

    connection = new telnet();
    openvpnEmitter = new EventEmitter();

    connection.on('end', function () {
        openvpnEmitter.emit('end');
    });
    connection.on('close', function () {
        openvpnEmitter.emit('close');
    });
    connection.on('error', function (error) {
        console.error(error);
        openvpnEmitter.emit('error', error);
    });

    return new Promise(function (resolve) {
        resolve(
            connection.connect(
                _.defaults(params, {
                    host: '127.0.0.1',
                    port: 1337,
                    shellPrompt: '',
                    timeout: 2
                })
            )
        );
    });
}

function disconnect() {
    return execute('signal SIGTERM');
}

function execute(cmd) {
    return new Promise(async function (resolve, reject) {
        if (connection) {
            await connection.exec(cmd);
            setTimeout(function () {
                if (connection.stringData) resolve(connection.stringData);
                else resolve(null);
            }, 1000);
        } else reject('Connection lost.');
    });
}
