(function () {
    let gameCtx;
    let init = function () {
        let gameCanvas = document.getElementById("myCanvas");
        gameCtx = gameCanvas.getContext("2d");

        gameCtx.moveTo(0, 0);
        gameCtx.lineTo(2000, 1000);
        gameCtx.stroke();
    }
    window.onload = function () {
        init();
    };


})()