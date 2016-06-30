var gui = require("nw.gui");
var win = gui.Window.get();


var imageBoard, clipLayout = document.getElementById('gray_layout');

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

document.body.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    close();
    return false;
}, false);

// esc
document.body.onkeyup = function (e) {
    var keycode = e.which || e.keyCode
    if (keycode == 27) {
        e.preventDefault();
        close();
        return false;
    }
};

function close() {


    var ctx = clipLayout.getContext('2d');
    ctx.clearRect(0, 0, clipLayout.width, clipLayout.height);

    document.body.style.backgroundImage = 'none';
    win.hide()
    // win.showDevTools();
}

function init(img) {
    document.body.style.backgroundImage = 'url(' + img + ')';

    var pos = null,
        ctx = clipLayout.getContext('2d');

    clipLayout.height = window.screen.height * window.devicePixelRatio;
    clipLayout.width = window.screen.width * window.devicePixelRatio;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, clipLayout.width, clipLayout.height);
    setTimeout(function () {
        win.show();
    }, 0)

    clipLayout.onmousedown = function (e) {
        pos = {
            x: e.clientX,
            y: e.clientY
        };
    };

    clipLayout.onmousemove = function (e) {
        if (null === pos) {
            return;
        }
        var left = Math.min(pos.x, e.clientX),
            top = Math.min(pos.y, e.clientY),
            width = Math.abs(pos.x - e.clientX),
            height = Math.abs(pos.y - e.clientY);

        drawClip(left, top, width, height);
    };

    clipLayout.onmouseup = function (e) {
        var left = Math.min(pos.x, e.clientX),
            top = Math.min(pos.y, e.clientY),
            width = Math.abs(pos.x - e.clientX),
            height = Math.abs(pos.y - e.clientY);

        clipLayout.onmousedown = null;
        clipLayout.onmousemove = null;
        clipLayout.onmouseup = null;
        pos = null;

        completeClip(left, top, width, height);
        drawToolbox(left, top, width, height);
    };
}

function completeClip(left, top, width, height) {
    var newLeft, newTop, newWidth, newHeight, dtLeft, dtTop, pos = null, handle = true, moved = false;

    clipLayout.onmousedown = function (e) {
        dtLeft = window.screen.height - top - height < 60 ? left : left + width - 120;
        dtTop = window.screen.height - top - height < 60 ? top - 50 : top + height + 10;

        if (handle && e.clientX > dtLeft - 40 && e.clientX < dtLeft + 0 &&
            e.clientY > dtTop && e.clientY < dtTop + 40) {
            var ctx = clipLayout.getContext('2d');

            handle = false;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.clearRect(0, 0, clipLayout.width, clipLayout.height);
            ctx.fillRect(0, 0, clipLayout.width, clipLayout.height);
            ctx.clearRect((left - 2) * window.devicePixelRatio,
                (top - 2) * window.devicePixelRatio,
                (width + 4) * window.devicePixelRatio,
                (height + 4) * window.devicePixelRatio);

            ctx.beginPath();
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#5bcbf5';
            ctx.rect((left - 2) * window.devicePixelRatio,
                (top - 2) * window.devicePixelRatio,
                (width + 4) * window.devicePixelRatio,
                (height + 4) * window.devicePixelRatio);
            ctx.stroke();

            drawToolbox(left, top, width, height);
            startEdit(left, top, width, height); //edit
        } else if (e.clientX > dtLeft + 0 && e.clientX < dtLeft + 40 &&
            e.clientY > dtTop && e.clientY < dtTop + 40) {
            close(); //cancel
        } else if (e.clientX > dtLeft + 40 && e.clientX < dtLeft + 80 &&
            e.clientY > dtTop && e.clientY < dtTop + 40) {
            finishEdit(left, top, width, height); //ok
        } else if (e.clientX > dtLeft + 80 && e.clientX < dtLeft + 120 &&
            e.clientY > dtTop && e.clientY < dtTop + 40) {
            finishEdit(left, top, width, height, true); //save
        } else if (e.clientX > left + 6 && e.clientX < left + width - 6 &&
            e.clientY > top + 6 && e.clientY < top + height - 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'move'
            }
        } else if (e.clientX > left - 6 && e.clientX < left + 6 &&
            e.clientY > top - 6 && e.clientY < top + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'topLeft'
            }
        } else if (e.clientX > left + width / 2 - 6 && e.clientX < left + width / 2 + 6 &&
            e.clientY > top - 6 && e.clientY < top + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'top'
            }
        } else if (e.clientX > left + width - 6 && e.clientX < left + width + 6 &&
            e.clientY > top - 6 && e.clientY < top + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'topRight'
            }
        } else if (e.clientX > left - 6 && e.clientX < left + 6 &&
            e.clientY > top + height / 2 - 6 && e.clientY < top + height / 2 + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'left'
            }
        } else if (e.clientX > left + width - 6 && e.clientX < left + width + 6 &&
            e.clientY > top + height / 2 - 6 && e.clientY < top + height / 2 + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'right'
            }
        } else if (e.clientX > left - 6 && e.clientX < left + 6 &&
            e.clientY > top + height - 6 && e.clientY < top + height + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'bottomLeft'
            }
        } else if (e.clientX > left + width / 2 - 6 && e.clientX < left + width / 2 + 6 &&
            e.clientY > top + height - 6 && e.clientY < top + height + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'bottom'
            }
        } else if (e.clientX > left + width - 6 && e.clientX < left + width + 6 &&
            e.clientY > top + height - 6 && e.clientY < top + height + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'bottomRight'
            }
        } else if (width < 12 && height < 12 &&
            e.clientX > left - 6 && e.clientX < left + width + 6 &&
            e.clientY > top - 6 && e.clientY < top + height + 6) {
            pos = {
                x: e.clientX,
                y: e.clientY,
                action: 'topLeft'
            }
        }
    };

    clipLayout.onmousemove = function (e) {
        if (null === pos || false === handle) {
            return;
        }

        moved = true;

        if ('move' === pos.action) {
            newLeft = left + e.clientX - pos.x;
            newTop = top + e.clientY - pos.y;

            newLeft = Math.max(newLeft, 0);
            newLeft = Math.min(newLeft, window.screen.width - width);
            newTop = Math.max(newTop, 0);
            newTop = Math.min(newTop, window.screen.height - height);

            newWidth = width;
            newHeight = height;
        } else if ('topLeft' === pos.action) {
            newLeft = left + e.clientX - pos.x;
            newTop = top + e.clientY - pos.y;
            newWidth = width + left - newLeft;
            newHeight = height + top - newTop;
        } else if ('top' === pos.action) {
            newLeft = left;
            newTop = top + e.clientY - pos.y;
            newWidth = width;
            newHeight = height + top - newTop;
        } else if ('topRight' === pos.action) {
            newLeft = left;
            newTop = top + e.clientY - pos.y;
            newWidth = width + e.clientX - pos.x;
            newHeight = height + top - newTop;
        } else if ('left' === pos.action) {
            newLeft = left + e.clientX - pos.x;
            newTop = top;
            newWidth = width + left - newLeft;
            newHeight = height;
        } else if ('right' === pos.action) {
            newLeft = left;
            newTop = top;
            newWidth = width + e.clientX - pos.x;
            newHeight = height;
        } else if ('bottomLeft' === pos.action) {
            newLeft = left + e.clientX - pos.x;
            newTop = top;
            newWidth = width + left - newLeft;
            newHeight = height + e.clientY - pos.y;
        } else if ('bottom' === pos.action) {
            newLeft = left;
            newTop = top;
            newWidth = width;
            newHeight = height + e.clientY - pos.y;
        } else if ('bottomRight' === pos.action) {
            newLeft = left;
            newTop = top;
            newWidth = width + e.clientX - pos.x;
            newHeight = height + e.clientY - pos.y;
        }

        drawClip(newLeft, newTop, newWidth, newHeight);
    };

    clipLayout.onmouseup = function (e) {
        newLeft = newWidth < 0 ? newLeft + newWidth : newLeft;
        newTop = newHeight < 0 ? newTop + newHeight : newTop;

        if (!isNaN(newLeft) && !isNaN(newTop) && !isNaN(newWidth) && !isNaN(newHeight)) {
            left = newLeft;
            top = newTop;
            width = Math.abs(newWidth);
            height = Math.abs(newHeight);
            if (moved !== false) {
                drawToolbox(left, top, width, height);
            }
        }

        pos = null;
        moved = false;
    };

    clipLayout.ondblclick = function (e) {
        if (e.clientX > left + 6 && e.clientX < left + width - 6 &&
            e.clientY > top + 6 && e.clientY < top + height - 6) {
            finishEdit(left, top, width, height);
        }
    };
}

function drawClip(left, top, width, height) {
    var ctx = clipLayout.getContext('2d');

    // 让中心区域半透明
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.clearRect(0, 0, clipLayout.width, clipLayout.height);
    ctx.fillRect(0, 0, clipLayout.width, clipLayout.height);
    ctx.clearRect((left ) * window.devicePixelRatio,
        (top ) * window.devicePixelRatio,
        (width ) * window.devicePixelRatio,
        (height) * window.devicePixelRatio);

    // 截屏线
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#00AEFF';
    ctx.rect((left) * window.devicePixelRatio,
        (top) * window.devicePixelRatio,
        (width) * window.devicePixelRatio,
        (height) * window.devicePixelRatio);
    ctx.stroke();

    // 点
    ctx.fillStyle = '#00AEFF';
    ctx.beginPath();
    ctx.arc((left) * window.devicePixelRatio,
        (top) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left + width / 2) * window.devicePixelRatio,
        (top) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left + width) * window.devicePixelRatio,
        (top) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left) * window.devicePixelRatio,
        (top + height / 2) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left + width) * window.devicePixelRatio,
        (top + height / 2) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.arc((left) * window.devicePixelRatio,
        (top + height) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left + width / 2) * window.devicePixelRatio,
        (top + height) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc((left + width) * window.devicePixelRatio,
        (top + height) * window.devicePixelRatio,
        3, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制大小
    var text = width + " x " + height;
    ctx.fillStyle = '#00AEFF';
    ctx.font = 15 * window.devicePixelRatio + 'px "Microsoft YaHei"';

    var x = left + 15 * window.devicePixelRatio + width;
    var y = top + 35 * window.devicePixelRatio + height;
    ctx.fillText(text, x, y);
}

function drawToolbox(left, top, width, height) {
    var ctx = clipLayout.getContext('2d'),
        dtLeft = (window.screen.height - top - height < 60 ? left : left + width - 120) * window.devicePixelRatio,
        dtTop = (window.screen.height - top - height < 60 ? top - 50 : top + height + 10) * window.devicePixelRatio;

    var gradient = ctx.createLinearGradient(0, dtTop, 0, dtTop + 40 * window.devicePixelRatio);
    gradient.addColorStop(0, '#404040');
    gradient.addColorStop(1, '#282828');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(dtLeft - 38, dtTop, 160 * window.devicePixelRatio, 40 * window.devicePixelRatio, 3 * window.devicePixelRatio);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 20 * window.devicePixelRatio + 'px FontAwesome';
    ctx.fillText("\uf040", dtLeft - 24 * window.devicePixelRatio, dtTop + 28 * window.devicePixelRatio); //edit
    ctx.fillStyle = '#ff3f3f';
    ctx.fillText("\uf00d", dtLeft + 14 * window.devicePixelRatio, dtTop + 28 * window.devicePixelRatio); //cacel
    ctx.fillStyle = '#1fe845';
    ctx.fillText("\uf00c", dtLeft + 52 * window.devicePixelRatio, dtTop + 28 * window.devicePixelRatio); //ok
    ctx.fillStyle = '#1fe845';
    ctx.fillText("\uf0c7", dtLeft + 90 * window.devicePixelRatio, dtTop + 28 * window.devicePixelRatio); //save
}

function startEdit(left, top, width, height) {
    var board = document.getElementById('board');

    board.style.left = left + 'px';
    board.style.top = top + 'px';
    board.style.width = width + 'px';
    board.style.height = height + 'px';

    imageBoard = new DrawingBoard.Board('board', {
        controls: ['Color'],
        color: '#f00',
        background: 'rgba(0, 0, 0, 0)',
        size: 2,
        webStorage: false
    });

    board.ondblclick = function (e) {
        if (e.clientX > left + 6 && e.clientX < left + width - 6 &&
            e.clientY > top + 6 && e.clientY < top + height - 6) {
            finishEdit(left, top, width, height);
        }
    };
}

function finishEdit(left, top, width, height, saveimg) {
    var tmp = document.getElementById('tmp');
    tmp.width = width * devicePixelRatio;
    tmp.height = height * devicePixelRatio;

    var ctx = tmp.getContext('2d');
    var img = new Image();
    img.src = localStorage.capture;
    img.onload = function () {
        ctx.drawImage(img,
            left * window.devicePixelRatio,
            top * window.devicePixelRatio,
            width * window.devicePixelRatio,
            height * window.devicePixelRatio,
            0, 0, width * window.devicePixelRatio,
            height * window.devicePixelRatio);
        if (imageBoard) {
            ctx.drawImage(imageBoard.canvas, 0, 0,
                width * window.devicePixelRatio,
                height * window.devicePixelRatio);
        }

        var data = tmp.toDataURL('image/jpeg').replace(/^data:image\/\w+;base64,/, "");
        finishCapture(data, saveimg);
        if (saveimg) {
            saveCaptureToFile(data);
        }
    }
}

function saveCaptureToFile(data) {
    var buffer = new Buffer(data, 'base64');

    var chooser = $("#recordFile");

    var f = new File('截图.jpg', '');
    var files = new FileList();
    files.append(f);
    chooser.unbind('change');
    document.getElementById('recordFile').files = files;
    chooser.bind('change', fileHandler);
    chooser.click();

    function fileHandler(e) {
        if (!e.target.files[0] || !e.target.files[0].path) {
            return
        }
        var path = e.target.files[0].path;
        var fs = require('fs');
        fs.writeFile(path, buffer, function (err) {
            close();
        });
    }
}

function finishCapture(data, saveimg) {
    var clipboard = nw.Clipboard.get();
    clipboard.set({
        type: 'jpeg',
        data: data,
        raw: true
    });

    win.setData(data);

    if (!saveimg) {
        close();
    }
}

win.init = init;