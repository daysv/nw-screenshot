/**
 * Created by sangzhe on 2016/6/29.
 */

(function (window) {
    "use strict";

    var nw = window.nw;
    if (!nw || !nw.Screen) {
        console.error('nw not found');
        return;
    }

    window.screenshot = screenshot

    var fs = require('fs');

    nw.Screen.Init();
    var screenWin;
    var dcm = nw.Screen.DesktopCaptureMonitor;

    var video = document.createElement('video');
    var canvas = document.createElement('canvas');

    nw.Window.open('./src/screenshot.html', {
        id: 'screenshot',
        always_on_top: true,
        transparent: false,
        show: false,
        width: window.screen.width * window.devicePixelRatio,
        height: window.screen.height * window.devicePixelRatio,
        min_width: window.screen.width * window.devicePixelRatio,
        min_height: window.screen.height * window.devicePixelRatio,
        frame: false,
        position: 'center',
        kiosk: true
    }, function (win) {
        screenWin = win
        win.on('closed', function () {
            screenWin = null;
            openWindow()
        })
    });

    function screenshot(callback) {
        screenWin.setData = function (data) {
            callback && callback(null, data);
            delete screenWin['setData'];
        }

        dcm.once("added", function (id, name, order, type) {
            if (type != 'screen') return;
            var constraints = {
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: dcm.registerStream(id),
                        maxHeight: window.screen.height * window.devicePixelRatio,
                        minHeight: window.screen.height * window.devicePixelRatio,
                        maxWidth: window.screen.width * window.devicePixelRatio,
                        minWidth: window.screen.width * window.devicePixelRatio
                    }
                }
            };
            navigator.getMedia = navigator.webkitGetUserMedia;
            navigator.getMedia(constraints
                , function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();
                        canvas.width = window.screen.width * window.devicePixelRatio;
                        canvas.height = window.screen.height * window.devicePixelRatio;
                        var context = canvas.getContext('2d');
                        context.drawImage(video, 0, 0);
                        var data = canvas.toDataURL('');

                        screenWin.init(data);

                        video.pause();
                        dcm.stop();

                        stream.getVideoTracks().forEach(function (track) {
                            track.stop();
                        });

                        setTimeout(function () {
                            video.src = "";
                        });

                    };
                }, function (err) {
                    callback(err);
                    dcm.stop();
                });

            dcm.stop();
        });

        dcm.start(true, true);
    }
})(typeof window !== "undefined" ? window : this);







