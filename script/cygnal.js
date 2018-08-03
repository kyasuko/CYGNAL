(function () {

    const CANVAS_DATA = { W: 800, H: 600, ID: "myCanvas" };
    let ImgFactory = {};
    let gameCtx;
    let renderTick;
    let init = function () {
        let gameCanvas = document.getElementById(CANVAS_DATA.ID);
        gameCtx = gameCanvas.getContext("2d");
        GameManeger();


    }
    let GameManeger = function () {
        let varableManeger = {
            clear: {
                Render: function () {
                    gameCtx.clearRect(0, 0, CANVAS_DATA.W, CANVAS_DATA.H);
                }
            },
            menu: {
                isOpen: true,
                circle1Angle: 0,
                circle2Angle: 0,
                changeAngle: function (angle) {
                    if (angle >= 360) angle = 0;
                    if (angle <= -360) angle = 0;
                    return angle;
                },
                Render: function () {
                    if (!this.isOpen) return;

                    this.circle1Angle = this.changeAngle(this.circle1Angle + 1);
                    this.circle2Angle = this.changeAngle(this.circle2Angle - 1);


                    imgFactoryDraw(ImgFactory.menu_bg);
                    for (var i = 0; i < ImgFactory.menu_btns.length; i++) {
                        imgFactoryDraw(ImgFactory.menu_btns[i]);
                        imgFactoryDraw(ImgFactory.menu_circle1, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, this.circle1Angle)
                        imgFactoryDraw(ImgFactory.menu_circle2, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, this.circle2Angle)
                    }
                    imgFactoryDraw(ImgFactory.menu_title)
                }
            },
            stage: {
                difficulty: 0,
                isOpen: false,
                Render: function () {
                    if (!this.isOpen) return;

                    imgFactoryDraw(ImgFactory.stage_bg)
                }
            }
        }

        let eventManeger = {
            changeCursor: {
                pointer: function () { $("#" + CANVAS_DATA.ID).css('cursor', 'pointer') },
                default: function () { $("#" + CANVAS_DATA.ID).css('cursor', 'default') }
            },
            mouse: {
                initEvent: function () {
                    if (varableManeger.menu.isOpen) {
                        this.menu.addEvent();
                    }
                    else {

                    }
                },
                isInCircle: function (x0, y0, x1, y1, r) {
                    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < r
                },
                menu: {
                    end: function (difficulty) {
                        varableManeger.menu.isOpen = false;
                        varableManeger.stage.difficulty = difficulty;
                        varableManeger.stage.isOpen = true;
                        eventManeger.changeCursor.default();
                        this.removeEvent();
                    },
                    btnsDetect: function (e, element, callback) {

                        let parentOffset = $(element).offset();
                        let xPosition = e.pageX - parentOffset.left;
                        let yPosition = e.pageY - parentOffset.top;

                        let menuBtns = ImgFactory.menu_btns;
                        for (var i = 0; i < menuBtns.length; i++) {
                            let menuBtnX = menuBtns[i].x + menuBtns[i].width / 2;
                            let menuBtnY = menuBtns[i].y + menuBtns[i].height / 2;
                            let menuBtnRadius = menuBtns[i].width / 2;

                            if (eventManeger.mouse.isInCircle(xPosition, yPosition, menuBtnX, menuBtnY, menuBtnRadius)) {

                                callback({ isin: true, difficulty: i });
                                return;
                            }
                        }

                        callback({ isin: false })
                    },
                    handleClick: function (e) {
                        let self = e.data.self;
                        self.btnsDetect(e, this, function (response) {
                            if (!response.isin) return;
                            self.end(response.difficulty);
                        })
                    },
                    handleMouseMove: function (e) {
                        let self = e.data.self;
                        self.btnsDetect(e, this, function (response) {
                            if (response.isin) {
                                eventManeger.changeCursor.pointer()
                            } else {
                                eventManeger.changeCursor.default()
                            }
                        })
                    },
                    addEvent: function () {
                        $("#" + CANVAS_DATA.ID).on("click", { self: this }, this.handleClick);
                        $("#" + CANVAS_DATA.ID).on("mousemove", { self: this }, this.handleMouseMove);
                    },
                    removeEvent: function () {
                        $("#" + CANVAS_DATA.ID).off("click", this.handleClick);
                        $("#" + CANVAS_DATA.ID).off("mousemove", this.handleMouseMove);
                    }
                },
                clearStage: {
                    add: function () {

                    },
                    remove: function () {

                    }
                }
            },



            keydown: {
                initEvent: function () {
                    window.addEventListener("keydown", function (e) {

                        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                            e.preventDefault();
                        }
                    }, false);
                }
            }
        }

        let Render = function () {
            requestAnimationFrame(Render);

            varableManeger.clear.Render();
            varableManeger.menu.Render();
            varableManeger.stage.Render();

        }
        let setEvent = function () {
            eventManeger.keydown.initEvent();
            eventManeger.mouse.initEvent();
        }




        setEvent();
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



        loadAllImg.then(function () {
            init();
        })

    };


})()