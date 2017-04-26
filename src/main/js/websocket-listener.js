// The below was provided by the reference tutorial under the Creative Commons License

'use strict';

var SockJS = require('sockjs-client');
require('stompjs');

function register(registrations) {
    var socket = SockJS('/io');
    var stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        registrations.forEach(function (registration) {
            stompClient.subscribe(registration.route, registration.callback);
        });
    });
}

module.exports.register = register;