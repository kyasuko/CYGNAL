(function () {
    let ImgFactory = {};
    let gameCtx;
    let init = function () {
        let gameCanvas = document.getElementById("myCanvas");
        gameCtx = gameCanvas.getContext("2d");

        gameCtx.drawImage(ImgFactory.menu_bg.img, 0, 0,ImgFactory.menu_bg.width,ImgFactory.menu_bg.height);
        
 
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
                                imageobj: obj[i],
                                key: key,
                                isArray: true,
                                index: i
                            })
                        }
                    }
                    else {
                        callback({
                            imageobj: obj,
                            key: key,
                            isArray: false,
                        })
                    }
                }
            }

        }
        let imageLoadSystem = function (response) {
            let image = new Image();
            image.onload = function () {
                var imageobj = response.imageobj;
                imageobj.img=image

                currentImgCount++
                if (response.isArray) {
                    if (ImgFactory[response.key] == null) {
                        ImgFactory[response.key] = [];
                    }
                   
                    ImgFactory[response.key][response.index] = imageobj;

                } else {
                    ImgFactory[response.key] = imageobj;
                }
                if (currentImgCount == totalImgLengh) {
                    resolve();
                    
                }
        
            }
            image.src = 'img/' + response.imageobj.src;


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