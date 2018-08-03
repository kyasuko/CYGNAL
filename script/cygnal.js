(function () {

    const CANVAS_DATA = { W: 800, H: 600 };
    let ImgFactory = {};
    let gameCtx;
    let renderTick;
    let init = function () {
        let gameCanvas = document.getElementById("myCanvas");
        gameCtx = gameCanvas.getContext("2d");
        RenderManeger();


    }
    let RenderManeger = function () {
        let varableManeger = {
            menu: {
                circle1Angle: 0,
                circle2Angle: 0
            }
        }

        let Render = function () {
            requestAnimationFrame(Render);


            renderClear()
            menuRender();

        }

        let renderClear = function () {
            gameCtx.clearRect(0, 0, CANVAS_DATA.W, CANVAS_DATA.H);
        }
        let menuRender = function () {
            let menuVar = varableManeger.menu;
            menuVar.circle1Angle += 1;
            menuVar.circle2Angle -= 1;


            imgFactoryDraw(ImgFactory.menu_bg);
            for (var i = 0; i < ImgFactory.menu_btns.length; i++) {
                imgFactoryDraw(ImgFactory.menu_btns[i]);
                imgFactoryDraw(ImgFactory.menu_circle1, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, menuVar.circle1Angle)
                imgFactoryDraw(ImgFactory.menu_circle2, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, menuVar.circle2Angle)
            }
            imgFactoryDraw(ImgFactory.menu_title)
        }


        Render();



    }


    let imgFactoryDraw = function (ImgFactoryObj, replaceX, replaceY, rotateAngle) {

        let x = (replaceX == null) ? ImgFactoryObj.x : replaceX;
        let y = (replaceY == null) ? ImgFactoryObj.y : replaceY;


        if (rotateAngle != null) {
            gameCtx.save();
            gameCtx.translate(x + ImgFactoryObj.width / 2, y + ImgFactoryObj.height / 2);
            gameCtx.rotate(rotateAngle * Math.PI / 180);
            gameCtx.drawImage(ImgFactoryObj.img, -ImgFactoryObj.width / 2, -ImgFactoryObj.height / 2, ImgFactoryObj.width, ImgFactoryObj.height);
            gameCtx.restore();
        }
        else {
            gameCtx.drawImage(ImgFactoryObj.img, ImgFactoryObj.x, ImgFactoryObj.y, ImgFactoryObj.width, ImgFactoryObj.height);
        }

    }

    let eventInit = function () {
        window.addEventListener("keydown", function (e) {

            if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
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

                imageobj.img = image

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
        eventInit();


        loadAllImg.then(function () {
            init();
        })

    };


})()