(function () {

    const CANVAS_DATA = { W: 800, H: 600, ID: "myCanvas" };
    let ImgFactory = {};
    let ObjectData = {};
    let StageData = {};
    let CharaData = {};

    let gameCtx;
    let renderTick;

    let GameManager = function () {
        let BodyManager = {
            TYPE: {
                CHARA: 0,
                CUBE: 1
            },
            objects: [],
            insertNewBody: function (type, position, posErr, collisionStatus) {
                let obj = {};
                obj.type = type;
                obj.pos = position;
                obj.posErr = posErr;
                obj.collisionStatus = collisionStatus;
                obj.id = this.objects.length;
                this.objects.push(obj);
            },
            getRealBody: function (obj) {
                return {
                    x: obj.pos.x + obj.posErr.x,
                    y: obj.pos.y + obj.posErr.y,
                    width: obj.posErr.width,
                    height: obj.posErr.height

                }
            },
            isMovableType: function (obj) {
                return obj.collisionStatus.canfall;
            },
            setIsGround: function (obj, isground) {
                if (this.isMovableType(obj) && !obj.collisionStatus.isground) {
                    obj.collisionStatus.velocity.y = 0;
                    obj.collisionStatus.isground = true;
                }

            },
            setIsFly: function (obj) {
                if (this.isMovableType(obj) && obj.collisionStatus.isground) {
                    obj.collisionStatus.isground = false;
                }
            },
            isOverlap_rect: function (r1, r2) {
                let r1l = r1.x - r1.width / 2;
                let r1r = r1.x + r1.width / 2;
                let r1t = r1.y - r1.height / 2;
                let r1b = r1.y + r1.height / 2;
                let r2l = r2.x - r2.width / 2;
                let r2r = r2.x + r2.width / 2;
                let r2t = r2.y - r2.height / 2;
                let r2b = r2.y + r2.height / 2;

                return !(r2l > r1r ||
                    r2r < r1l ||
                    r2t > r1b ||
                    r2b < r1t);
            },
            Updata: function () {

                let movableObjs = this.objects.filter(o => this.isMovableType(o));
                for (var i = 0; i < movableObjs.length; i++) {
                    let movableObj = movableObjs[i];
                    movableObj.pos.x += 3;
                    let isTouchGround = false;
                    for (var j = 0; j < this.objects.length; j++) {


                        let obj2 = this.objects[j]
                        if (movableObj.id == obj2.id) continue;

                        if (this.isOverlap_rect(this.getRealBody(movableObj), this.getRealBody(obj2))) {
                            isTouchGround = true;
                            this.setIsGround(movableObj);
                            break;
                        }
                    }
                    if (movableObj.collisionStatus.isground && !isTouchGround) {
                        console.log('123');
                        this.setIsFly(movableObj)
                    }

                }
                /*
                for (var i = 0; i < this.objects.length; i++) {
                    let obj = this.objects[i];
                    MethodManager.debug(this.getRealBody(obj))
                }*/
            }

        }
        let MethodManager = {
            copyObject: function (obj) {
                return JSON.parse(JSON.stringify(obj));
            },
            gravity: function (velocity) {
                velocity.y += CharaData.gravitySpeed;
            },
            moveing: function (position, velocity) {
                position.x += velocity.x;
                position.y += velocity.y;
            },
            maxVelocityLimit: function (velocity, limitX, limitY) {
                if (limitY) {
                    if (velocity.y > CharaData.velocityLimit.y) {
                        velocity.y = CharaData.velocityLimit.y;
                    }
                }
                if (limitX) {
                    if (velocity.x > CharaData.velocityLimit.x) {
                        velocity.x = CharaData.velocityLimit.x;
                    }
                }
            },
            getImgFactoryObj: function (obj) {
                return ImgFactory[ObjectData.filter(data => data.type == obj.type)[0].name];
            },
            fk: 0,
            imgFactoryDraw: function (ImgFactoryObj, replacePos, replaceSize, rotateAngle) {

                let x = (replacePos == null) ? ImgFactoryObj.x : replacePos.x;
                let y = (replacePos == null) ? ImgFactoryObj.y : replacePos.y;
                let width = (replaceSize == null) ? ImgFactoryObj.width : replaceSize.width;
                let height = (replaceSize == null) ? ImgFactoryObj.height : replaceSize.height;


                let angle = (rotateAngle == null) ? 0 : rotateAngle;

                /*
                width -= this.fk;
                height -= this.fk;
                this.fk += 0.1;*/

                gameCtx.save();
                gameCtx.translate(x, y);
                gameCtx.rotate(angle * Math.PI / 180);
                gameCtx.globalAlpha = 1;
                gameCtx.drawImage(ImgFactoryObj.img, -width / 2, -height / 2, width, height);
                gameCtx.restore();


            },

            debug: function (ob) {
                gameCtx.save();
                gameCtx.translate(ob.x, ob.y);
                gameCtx.globalAlpha = 0.5;
                gameCtx.fillStyle = "#FF0000";
                gameCtx.fillRect(-ob.width / 2, -ob.height / 2, ob.width, ob.height);
                gameCtx.restore();
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
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle1, ImgFactory.menu_btns[i], null, this.circle1Angle)
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle2, ImgFactory.menu_btns[i], null, this.circle2Angle)
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
                        },
                        isStart: function () {
                            return this.flag;
                        }
                    },
                    isOpen: false,
                    difficulty: 0,
                    no: 0
                },
                setCurrentStage: function () {
                    this.status.currentStage = StageData.filter(data => data.difficulty == this.status.difficulty && data.no == this.status.no)[0];

                },
                gameStartInit: function (difficulty) {
                    this.status.difficulty = difficulty;
                    this.setCurrentStage();

                    this.objects.gameStartInit();
                    this.chara.gameStartInit()
                },
                activeOpen: function (flag) {
                    this.status.isOpen = flag;

                },
                init: function () {
                    this.background.init();
                    this.objects.init();
                    this.chara.init()
                    this.frontUI.init();

                },
                Render: function () {
                    this.background.Render();
                    this.objects.Render();
                    this.chara.Render()
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
                chara: {

                    position: {},
                    body: {},
                    size: {},
                    collisionStatus: { velocity: { x: 0, y: 0 }, isground: false, canfall: true },

                    currentFrame: 0,
                    frameTime: 0,
                    action: "",

                    init: function () {
                        this.status = varableManager.stage.status;


                    },
                    gameStartInit: function () {
                        this.position = this.status.currentStage.startPoint;
                        this.action = CharaData.ACTION.STAND;

                        this.body = MethodManager.copyObject(CharaData.body);
                        this.size = MethodManager.copyObject(this.currentImageObj());

                        BodyManager.insertNewBody(BodyManager.TYPE.CHARA, this.position, this.body, this.collisionStatus);

                    },
                    frameManager: function () {
                        this.frameTime++;
                        if (this.frameTime >= CharaData[this.action].frameTime) {
                            this.frameTime = 0
                            this.currentFrame++;
                            if (this.currentFrame >= ImgFactory[this.action].length - 1) {
                                this.currentFrame = 0;
                            }
                        }

                    },
                    currentImageObj: function () {
                        return ImgFactory[this.action][this.currentFrame];
                    },
                    getBody: function () {
                        return {
                            x: CharaData.body.x + this.position.x,
                            y: CharaData.body.y + this.position.y,
                            width: CharaData.body.width,
                            height: CharaData.body.height

                        }
                    },

                    Render: function () {
                        if (!this.status.isOpen) return;


                        this.frameManager();
                        if (!this.collisionStatus.isground) {
                            MethodManager.gravity(this.collisionStatus.velocity);
                        }
                        MethodManager.maxVelocityLimit(this.collisionStatus.velocity, true, true);
                        MethodManager.moveing(this.position, this.collisionStatus.velocity);


                        MethodManager.imgFactoryDraw(this.currentImageObj(), this.position, this.size)


                    }
                },
                objects: {
                    store: {},
                    init: function () {
                        this.status = varableManager.stage.status;
                    },
                    gameStartInit: function () {
                        this.store = MethodManager.copyObject(this.status.currentStage.objects);
                        for (var i = 0; i < this.store.length; i++) {

                            let imgFactoryObj = MethodManager.getImgFactoryObj(this.store[i]);
                            this.store[i].imgFactoryObj = { img: imgFactoryObj.img };
                            this.store[i].size = MethodManager.copyObject(imgFactoryObj);
                            this.store[i].collisionStatus = { isground: false, canfall: false };

                            let obj = this.store[i];

                            BodyManager.insertNewBody(BodyManager.TYPE.CUBE, obj.position, obj.size, obj.collisionStatus);
                        }

                    },
                    Render: function () {
                        if (!this.status.isOpen) return;

                        for (var i = 0; i < this.store.length; i++) {
                            let obj = this.store[i];

                            MethodManager.imgFactoryDraw(obj.imgFactoryObj, obj.position, obj.size, obj.angle)
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
                        varableManager.stage.gameStartInit(difficulty);
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
                            let menuBtnX = menuBtns[i].x;
                            let menuBtnY = menuBtns[i].y;
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
                        if (varableManager.stage.status.game.isStart()) {
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
            BodyManager.Updata();
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
    let loadCharaData = new Promise((resolve) => {
        fetch('data/charaData.json').then(function (response) {
            return response.json();
        }).then(function (JsonObject) {
            CharaData = JsonObject;
            resolve();
        })
    });

    window.onload = function () {



        loadAllImg.then(function () {
            loadStageData.then(function () {
                loadObjectData.then(function () {
                    loadCharaData.then(function () {
                        GameManager();
                    })
                })
            })
        })

    };


})()