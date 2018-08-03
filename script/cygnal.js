(function () {
    let imgFactory = {};
    let gameCtx;
    let init = function () {
        let gameCanvas = document.getElementById("myCanvas");
        gameCtx = gameCanvas.getContext("2d");

        gameCtx.moveTo(0, 0);
        gameCtx.lineTo(2000, 1000);
        gameCtx.stroke();
    }

    let loadAllImg = function () {
        new Promise((resolve) => {
            fetch('script/imageData.json').then(function (response) {
                return response.json();
            }).then(function (JsonObject) {
                    console.log(JsonObject);
                    resolve();
                })
        });
    }
    window.onload = function () {
        loadAllImg(function () {
            init();
        })

    };


})()