(function () {

    const CANVAS_DATA = { W: 800, H: 600, ID: "myCanvas" };
    let ImgFactory = {};
    let ObjectData = {};
    let StageData = {};

    let gameCtx;
    let renderTick;

    let GameManeger = function () {
        let MethodManager = {
            getImgFactoryObj: function (obj) {
                return ImgFactory[ObjectData.filter(data => data.type == obj.type)[0].name];
            },
            imgFactoryDraw: function (ImgFactoryObj, replaceX, replaceY, rotateAngle) {

                let x = (replaceX == null) ? ImgFactoryObj.x : replaceX;
                let y = (replaceY == null) ? ImgFactoryObj.y : replaceY;


                if (rotateAngle != null) {
                    gameCtx.save();
                    gameCtx.translate(x + ImgFactoryObj.width / 2, y + ImgFactoryObj.height / 2);
                    gameCtx.rotate(rotateAngle * Math.PI / 180);
                    gameCtx.globalAlpha = 1;
                    gameCtx.drawImage(ImgFactoryObj.img, -ImgFactoryObj.width / 2, -ImgFactoryObj.height / 2, ImgFactoryObj.width, ImgFactoryObj.height);
                    gameCtx.restore();
                }
                else {
                    gameCtx.globalAlpha = 1;
                    gameCtx.drawImage(ImgFactoryObj.img, ImgFactoryObj.x, ImgFactoryObj.y, ImgFactoryObj.width, ImgFactoryObj.height);
                }

            },
            changeAngle: function (angle) {
                if (angle >= 360) angle = 0;
                if (angle <= -360) angle = 0;
                return angle;
            },
            isInCircle: function (x0, y0, x1, y1, r) {
                return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < r
            }
        }
        var varableManager = {
            clear: {
                Render: function () {
                    gameCtx.clearRect(0, 0, CANVAS_DATA.W, CANVAS_DATA.H);
                }
            },
            blackscene: {
                isOpen: false,
                globalAlpha: { value: 0, dir: 1 },
                scene: null,

                activeOpen: function (flag) {
                    this.isOpen = flag
                },
                setSceneSwitching: function (scene) {
                    this.activeOpen(true);
                    this.scene = scene;
                },
                globalAlphaChange: function () {
                    this.globalAlpha.value += 0.04 * this.globalAlpha.dir;
                    if (this.globalAlpha.value >= 1) {
                        this.globalAlpha.value = 1;
                        this.globalAlpha.dir = -1;



                        this.scene.previous.activeOpen(false);
                        this.scene.after.activeOpen(true);
                    }
                    else if (this.globalAlpha.value <= 0) {
                        this.globalAlpha.value = 0;
                        this.globalAlpha.dir = 1;
                    }


                },
                globalAlphaEnd: function () {
                    if (this.globalAlpha.value <= 0) {
                        this.globalAlpha.value = 0;
                        this.activeOpen(false);

                        this.scene.callback();
                    }

                },
                Render: function () {
                    if (!this.isOpen) return;
                    this.globalAlphaChange();
                    gameCtx.globalAlpha = this.globalAlpha.value;
                    gameCtx.fillStyle = "#000";
                    gameCtx.fillRect(0, 0, CANVAS_DATA.W, CANVAS_DATA.H);
                    this.globalAlphaEnd();

                }
            },
            menu: {
                isOpen: true,
                circle1Angle: 0,
                circle2Angle: 0,

                activeOpen: function (flag) {
                    this.isOpen = flag
                },
                Render: function () {
                    if (!this.isOpen) return;

                    this.circle1Angle = MethodManager.changeAngle(this.circle1Angle + 1);
                    this.circle2Angle = MethodManager.changeAngle(this.circle2Angle - 1);


                    MethodManager.imgFactoryDraw(ImgFactory.menu_bg);
                    for (var i = 0; i < ImgFactory.menu_btns.length; i++) {
                        MethodManager.imgFactoryDraw(ImgFactory.menu_btns[i]);
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle1, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, this.circle1Angle)
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle2, ImgFactory.menu_btns[i].x, ImgFactory.menu_btns[i].y, this.circle2Angle)
                    }
                    MethodManager.imgFactoryDraw(ImgFactory.menu_title)
                }
            },
            stage: {
                status: {
                    currentStage: [],
                    game: {
                        flag: false,
                        start: function () {
                            this.flag = true;
                        },
                        end: function () {
                            this.flag = false;
                        }
                    },
                    isOpen: false,
                    difficulty: 0,
                    no: 0
                },
                setCurrentStage: function () {
                    this.status.currentStage = StageData.filter(data => data.difficulty == this.status.difficulty && data.no == this.status.no)[0];

                },
                setDifficulty: function (difficulty) {
                    this.status.difficulty = difficulty;
                    this.setCurrentStage();
                },
                activeOpen: function (flag) {
                    this.status.isOpen = flag;

                },
                init: function () {
                    this.background.init();
                    this.objects.init();
                    this.frontUI.init();
                },
                Render: function () {
                    this.background.Render();
                    this.objects.Render();
                    this.frontUI.Render();

                },
                background: {
                    init: function () {
                        this.status = varableManager.stage.status;
                    },
                    Render: function () {
                        if (!this.status.isOpen) return;

                        MethodManager.imgFactoryDraw(ImgFactory.stage_bg)
                    }
                },
                objects: {
                    init: function () {
                        this.status = varableManager.stage.status;
                    },
                    Render: function () {
                        if (!this.status.isOpen) return;

                        for (var i = 0; i < this.status.currentStage.objects.length; i++) {
                            let obj = this.status.currentStage.objects[i];
                            let imgFactoryObj = MethodManager.getImgFactoryObj(obj);
                            MethodManager.imgFactoryDraw(imgFactoryObj, obj.position.x, obj.position.y, obj.angle)
                        }
                    }
                },
                frontUI: {
                    init: function () {
                        this.status = varableManager.stage.status;
                    },
                    Render: function () {
                        if (!this.status.isOpen) return;

                        //MethodManager.imgFactoryDraw(ImgFactory.stage_front)
                    }
                }
            }
        }

        let eventManager = {
            changeCursor: {
                pointer: function () { $("#" + CANVAS_DATA.ID).css('cursor', 'pointer') },
                default: function () { $("#" + CANVAS_DATA.ID).css('cursor', 'default') }
            },
            mouse: {
                initEvent: function () {
                    if (varableManager.menu.isOpen) {
                        this.menu.addEvent();
                    }
                    else {

                    }
                },
                menu: {
                    end: function (difficulty) {
                        varableManager.stage.setDifficulty(difficulty);
                        varableManager.blackscene.setSceneSwitching({
                            previous: varableManager.menu, after: varableManager.stage, callback: function () {
                                varableManager.stage.status.game.start();
                            }
                        });

                        eventManager.changeCursor.default();
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

                            if (MethodManager.isInCircle(xPosition, yPosition, menuBtnX, menuBtnY, menuBtnRadius)) {

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
                                eventManager.changeCursor.pointer()
                            } else {
                                eventManager.changeCursor.default()
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
                        if (varableManager.stage.game.flag) {
                            console.log('15fsd6')
                        }

                        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                            e.preventDefault();
                        }
                    }, false);
                }
            }
        }
        let init = function () {
            let gameCanvas = document.getElementById(CANVAS_DATA.ID);
            gameCtx = gameCanvas.getContext("2d");

            varableManager.stage.init();

        }
        let Render = function () {
            requestAnimationFrame(Render);

            varableManager.clear.Render();
            varableManager.menu.Render();
            varableManager.stage.Render();
            varableManager.blackscene.Render();

        }
        let setEvent = function () {
            eventManager.keydown.initEvent();
            eventManager.mouse.initEvent();
        }



        init();
        setEvent();
        Render();



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

        fetch('data/imageData.json').then(function (response) {
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

    let loadStageData = new Promise((resolve) => {
        fetch('data/stageData.json').then(function (response) {
            return response.json();
        }).then(function (JsonObject) {
            StageData = JsonObject;
            resolve();
        })
    });
    let loadObjectData = new Promise((resolve) => {
        fetch('data/objectData.json').then(function (response) {
            return response.json();
        }).then(function (JsonObject) {
            ObjectData = JsonObject;
            resolve();
        })
    });

    window.onload = function () {



        loadAllImg.then(function () {
            loadStageData.then(function () {
                loadObjectData.then(function () {
                    GameManeger();
                })
            })
        })

    };


})()