(function () {
    let ImgFactory = {};
    let gameCtx;
    let init = function () {
        let gameCanvas = document.getElementById("myCanvas");
        gameCtx = gameCanvas.getContext("2d");

        gameCtx.drawImage(ImgFactory.menu_bg, 0, 0,800,600);
        console.log('1213213213');
 
    }

    let loadAllImg = new Promise((resolve) => {
        let currentImgCount = 0;
        let totalImgLengh = 0;
        let iteratorImg = function (JsonObject, callback) {
            for (var key in JsonObject) {
                if (JsonObject.hasOwnProperty(key)) {
                    var obj = JsonObject[key];
                    if (Array.isArray(obj)) {
                        for (var i = 0; i < obj.length; i++) {
                            callback({
                                imagesrc: obj[i],
                                key: key,
                                isArray: true,
                                index: i
                            })
                        }
                    }
                    else {
                        callback({
                            imagesrc: obj,
                            key: key,
                            isArray: false,
                        })
                    }
                }
            }

        }
        let imageLoadSystem = function (response) {
            var image = new Image();
            image.onload = function () {
                currentImgCount++
                if (response.isArray) {
                    if (ImgFactory[response.key] == null) {
                        ImgFactory[response.key] = [];
                    }
                    ImgFactory[response.key][response.index] = image;

                } else {
                    ImgFactory[response.key] = image;
                }
                if (currentImgCount == totalImgLengh) {
                    resolve();
                    
                }
                console.log(currentImgCount+","+totalImgLengh);
            }
            image.src = 'img/' + response.imagesrc;


        }

        fetch('script/imageData.json').then(function (response) {
            return response.json();
        }).then(function (JsonObject) {
            iteratorImg(JsonObject, function (response) {
                totalImgLengh++;
            });
            iteratorImg(JsonObject, function (response) {
                imageLoadSystem(response)
            });
        })
    });

    window.onload = function () {
        loadAllImg.then(function () {
            init();
        })

    };


})()