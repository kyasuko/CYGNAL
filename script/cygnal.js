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
            OVERLAP_TYPE: {
                NONE: 0,
                TOP: 1,
                DOWN: 2,
                RIGHT: 3,
                LEFT: 4
            },
            objects: [],
            insertNewBody: function (collisionStatus) {
                let obj = {};
                obj.pos = collisionStatus.position;
                obj.posErr = collisionStatus.body;
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
            adjustCollisionObj(hitObj, behitObj, overlapType) {
                let hitObjBody = this.getRealBody(hitObj);
                let behitObjBody = this.getRealBody(behitObj);

                switch (overlapType) {
                    case this.OVERLAP_TYPE.TOP:
                        hitObj.collisionStatus.position.y = behitObjBody.y - behitObjBody.height / 2 - hitObjBody.height / 2
                        break;
                    case this.OVERLAP_TYPE.RIGHT:
                        hitObj.collisionStatus.position.x = behitObjBody.x + behitObjBody.width / 2 + hitObjBody.width / 2
                        break;
                    case this.OVERLAP_TYPE.LEFT:
                        hitObj.collisionStatus.position.x = behitObjBody.x - behitObjBody.width / 2 - hitObjBody.width / 2
                        break;
                }


            },
            setPos: {
                Ground: function (obj, obj2) {
                    let self = BodyManager;
                    if (!obj.collisionStatus.isground) {
                        obj.collisionStatus.velocity.y = 0;
                        obj.collisionStatus.isground = true;

                        self.adjustCollisionObj(obj, obj2, self.OVERLAP_TYPE.TOP)
                    }

                },
                Right: function (obj, obj2) {
                    let self = BodyManager;

                    obj.collisionStatus.velocity.x = 0;

                    self.adjustCollisionObj(obj, obj2, self.OVERLAP_TYPE.RIGHT)


                },
                Left: function (obj, obj2) {
                    let self = BodyManager;

                    obj.collisionStatus.velocity.x = 0;

                    self.adjustCollisionObj(obj, obj2, self.OVERLAP_TYPE.LEFT)


                }
            },
            setIsFly: function (obj) {
                if (this.isMovableType(obj) && obj.collisionStatus.isground) {
                    obj.collisionStatus.isground = false;
                }
            },
            detectOverlap_rect: function (r1, r2) {
                let r1l = r1.x - r1.width / 2;
                let r1r = r1.x + r1.width / 2;
                let r1t = r1.y - r1.height / 2;
                let r1b = r1.y + r1.height / 2;
                let r2l = r2.x - r2.width / 2;
                let r2r = r2.x + r2.width / 2;
                let r2t = r2.y - r2.height / 2;
                let r2b = r2.y + r2.height / 2;

                let isOverlap = !(r2l > r1r || r2r < r1l || r2t > r1b || r2b < r1t);
                if (isOverlap) {
                    //distance buttom,left,right
                    let Err = [Math.abs(r1b - r2t), Math.abs(r1l - r2r), Math.abs(r1r - r2l)];
                    let smallestIndex = 0;
                    var lowest = Number.POSITIVE_INFINITY;
                    for (var i = 0; i < Err.length; i++) {
                        if (Err[i] < lowest) {
                            lowest = Err[i];
                            smallestIndex = i;
                        }
                    }
                    if (smallestIndex == 1 && !(r2t > r1b || r2b < r1t)) {
                        return this.OVERLAP_TYPE.RIGHT;
                    }
                    else if (smallestIndex == 2 && !(r2l > r1r || r2r < r1l)) {
                        return this.OVERLAP_TYPE.LEFT;
                    }
                    else if (smallestIndex == 0 && !(r2l > r1r || r2r < r1l)) {
                        return this.OVERLAP_TYPE.TOP;
                    }

                } else {
                    return this.OVERLAP_TYPE.NONE;
                }
            },
            Updata: function () {

                let movableObjs = this.objects.filter(o => this.isMovableType(o));
                for (var i = 0; i < movableObjs.length; i++) {
                    let movableObj = movableObjs[i];
                    let isTouch = { Ground: false, Right: false, Left: false };

                    for (var j = 0; j < this.objects.length; j++) {


                        let obj2 = this.objects[j]
                        if (movableObj.id == obj2.id) continue;

                        let overlapType = this.detectOverlap_rect(this.getRealBody(movableObj), this.getRealBody(obj2))

                        if (overlapType == this.OVERLAP_TYPE.TOP) {
                            isTouch.Ground = true;
                            this.setPos.Ground(movableObj, obj2);
                        }
                        else if (overlapType == this.OVERLAP_TYPE.RIGHT) {
                            isTouch.Right = true;
                            this.setPos.Right(movableObj, obj2);
                        }
                        else if (overlapType == this.OVERLAP_TYPE.LEFT) {
                            isTouch.LEFT = true;
                            this.setPos.Left(movableObj, obj2);
                        }


                        if (isTouch.Ground == true && (isTouch.Right || isTouch.LEFT)) {
                            break;
                        }

                    }
                    if (movableObj.collisionStatus.isground && !isTouch.Ground) {
                        this.setIsFly(movableObj)
                    }

                }

                for (var i = 0; i < this.objects.length; i++) {
                    let obj = this.objects[i];
                    MethodManager.debug(this.getRealBody(obj))
                }
            }

        }
        let MethodManager = {
            copyObject: function (obj) {
                return JSON.parse(JSON.stringify(obj));
            },
            acceleration: function (collisionStatus, A, limit) {
                if (A.x != null) {
                    let dirX = Math.sign(A.x);
                    collisionStatus.velocity.x += A.x;

                    if (dirX == 1 && collisionStatus.velocity.x > limit.x ||
                        dirX == -1 && collisionStatus.velocity.x < limit.x) {
                        collisionStatus.velocity.x = limit.x;

                    }


                }
                if (A.y != null) {
                    collisionStatus.velocity.y += A.y;
                    if (collisionStatus.velocity.y > limit.y) {
                        collisionStatus.velocity.y = limit.y;
                    }
                }
            },
            gravity: function (collisionStatus) {
                this.acceleration(collisionStatus, { y: CharaData.gravitySpeed }, { y: CharaData.velocityLimit.y });
            },
            moving: function (collisionStatus) {
                collisionStatus.position.x += collisionStatus.velocity.x * collisionStatus.dir.x;
                collisionStatus.position.y += collisionStatus.velocity.y * collisionStatus.dir.y;
            },
            maxVelocityLimit: function (collisionStatus, limitX, limitY) {
                if (limitY) {
                    if (collisionStatus.velocity.y > CharaData.velocityLimit.y) {
                        collisionStatus.velocity.y = CharaData.velocityLimit.y;
                    }
                }
                if (limitX) {
                    if (collisionStatus.velocity.x > CharaData.velocityLimit.x) {
                        collisionStatus.velocity.x = CharaData.velocityLimit.x;
                    }
                }
            },
            getImgFactoryObj: function (obj) {
                return ImgFactory[ObjectData.filter(data => data.type == obj.type)[0].name];
            },
            fk: 0,
            imgFactoryDraw: function (ImgFactoryObj, para) {


                let obj = {};
                obj = ImgFactoryObj;
                obj.angle = 0;
                obj.flipX = 1;

                if (para != null) {
                    if (para.replacePos != null) {
                        obj.x = para.replacePos.x;
                        obj.y = para.replacePos.y;
                    }
                    if (para.rotateAngle != null) {
                        obj.angle = para.rotateAngle;
                    }
                    if (para.collisionStatus != null) {
                        obj.x = para.collisionStatus.position.x;
                        obj.y = para.collisionStatus.position.y;
                        obj.width = para.collisionStatus.size.width;
                        obj.height = para.collisionStatus.size.height;
                        obj.angle = para.collisionStatus.angle;
                        if (para.collisionStatus.dir != null) {
                            obj.flipX = para.collisionStatus.dir.x;
                        }
                    }
                }



                gameCtx.save();

                if (obj.flipX == -1) {
                    gameCtx.translate(2 * obj.x, 0);
                    gameCtx.scale(obj.flipX, 1);
                }
                gameCtx.translate(obj.x, obj.y);
                gameCtx.rotate(obj.angle * Math.PI / 180);
                gameCtx.globalAlpha = 1;
                gameCtx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
                gameCtx.restore();


            },

            debug: function (ob) {
                gameCtx.save();
                gameCtx.translate(ob.x, ob.y);
                gameCtx.globalAlpha = 0.2;
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
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle1, { replacePos: ImgFactory.menu_btns[i], rotateAngle: this.circle1Angle })
                        MethodManager.imgFactoryDraw(ImgFactory.menu_circle2, { replacePos: ImgFactory.menu_btns[i], rotateAngle: this.circle2Angle })
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

                    collisionStatus: {
                        dir: { x: 1, y: 1 },
                        position: {},
                        body: {},
                        size: {},
                        velocity: { x: 0, y: 0 },
                        isground: false,
                        isrun: false,
                        canfall: true
                    },

                    currentFrame: 0,
                    frameTime: 0,
                    action: "",

                    keydown: {
                        right: { flag: false, presstime: 0 },
                        left: { flag: false, presstime: 0, buffertime: 0 }
                    },

                    init: function () {
                        this.status = varableManager.stage.status;


                    },
                    gameStartInit: function () {

                        this.action = CharaData.ACTION.STAND;

                        this.collisionStatus.position = this.status.currentStage.startPoint;
                        this.collisionStatus.body = MethodManager.copyObject(CharaData.body);
                        this.collisionStatus.size = MethodManager.copyObject(this.currentImageObj());

                        this.actionManager.gameStartInit();
                        this.physicManager.gameStartInit();
                        this.keyDownManager.gameStartInit();

                        BodyManager.insertNewBody(this.collisionStatus);

                    },

                    currentImageObj: function () {
                        return ImgFactory[this.action][this.currentFrame];
                    },

                    actionManager: {
                        self: {},
                        gameStartInit: function () {
                            self = varableManager.stage.chara;
                        },
                        frameInit: function () {
                            self.frameTime = 0;
                            self.currentFrame = 0;
                        },
                        frameManager: function () {
                            self.frameTime++;
                            if (self.frameTime >= CharaData[self.action].frameTime) {
                                self.frameTime = 0
                                self.currentFrame++;
                                if (self.currentFrame >= ImgFactory[self.action].length - 1) {
                                    self.currentFrame = 0;
                                }
                            }

                        },
                        changeAction(action) {
                            if (self.action != action) {
                                this.frameInit();
                            }
                            self.action = action;
                        },
                        detectAction: function () {
                            if (!self.collisionStatus.isground) {
                                this.changeAction(CharaData.ACTION.FALL)
                            }
                            else if (self.collisionStatus.isrun) {
                                this.changeAction(CharaData.ACTION.RUN)
                            }
                            else {
                                this.changeAction(CharaData.ACTION.STAND)
                            }
                        },
                        Update: function () {
                            this.frameManager();
                            this.detectAction();
                        }

                    },
                    keyDownManager: {
                        self: {},
                        gameStartInit: function () {
                            self = varableManager.stage.chara;
                        },
                        leftright: {
                            flag: function (isRight, flag) {
                                if (isRight) {
                                    self.keydown.right.flag = flag
                                } else {
                                    self.keydown.left.flag = flag
                                }
                            },
                            getflag: function (isRight) {
                                return (isRight) ? self.keydown.right.flag : self.keydown.left.flag;
                            },
                            initTime: function (isRight) {
                                if (isRight) {
                                    self.keydown.right.presstime = 0;
                                } else {
                                    self.keydown.left.presstime = 0;
                                }
                            },
                        }



                    },
                    physicManager: {
                        self: {},
                        gameStartInit: function () {
                            self = varableManager.stage.chara;
                            this.runManager.gameStartInit();
                        },
                        runManager: {
                            self: {},
                            gameStartInit: function () {
                                self = varableManager.stage.chara;
                            },
                            setRunInit: function () {
                                self.collisionStatus.isrun = false;
                            },
                            setRunSpeedZero: function () {
                                self.collisionStatus.velocity.x = 0;
                            },
                            isRun: function () {
                                let flag = 0;
                                if (self.collisionStatus.isrun) flag = self.collisionStatus.dir.x
                                return flag;
                            },
                            setRun: function (flag, dirX) {
                                if (dirX != null) {
                                    self.collisionStatus.dir.x = dirX;
                                }
                                self.collisionStatus.isrun = flag;
                            },

                            running: function () {
                                if (self.collisionStatus.isrun) {
                                    let maxMoveSpeed = ((self.collisionStatus.isground) ? 1 : CharaData.skyMoveSpeedDelta) * CharaData.maxMoveSpeed;
                                    MethodManager.acceleration(self.collisionStatus, { x: CharaData.perMoveSpeed }, { x: maxMoveSpeed })
                                }
                                else {
                                    MethodManager.acceleration(self.collisionStatus, { x: -CharaData.perDecreaseSpeed }, { x: 0 })
                                }
                            },

                            Update: function () {
                                let right = self.keydown.right;
                                let left = self.keydown.left;

                                if (left.buffertime > 0) {
                                    left.buffertime--;
                                }


                                if (right.flag && right.presstime == 0 && left.presstime == 0) {
                                    this.setRunInit();
                                }
                                if (right.flag && right.presstime == 0 && left.buffertime != 0) {
                                    left.buffertime = 0;
                                    this.setRunSpeedZero();
                                }
                                if (left.flag && left.presstime == 0) {
                                    this.setRunSpeedZero();
                                    this.setRunInit();
                                }





                                if (right.flag) {
                                    right.presstime++;
                                    this.setRun(true, 1);
                                } else if (!right.flag && right.presstime > 0 && left.presstime == 0) {
                                    right.presstime = 0;
                                    this.setRunInit();
                                }

                                if (left.flag) {

                                    left.presstime++;
                                    this.setRun(true, -1);
                                } else if (!left.flag && left.presstime > 0) {
                                    left.presstime = 0;
                                    left.buffertime = 3;

                                    if (right.flag) {
                                        this.setRunSpeedZero();
                                    }
                                    this.setRunInit();
                                }







                                this.running();
                            }


                        },
                        Update: function () {
                            if (!self.collisionStatus.isground) {
                                MethodManager.gravity(self.collisionStatus);
                            }
                            this.runManager.Update();
                            MethodManager.moving(self.collisionStatus);
                        }
                    },

                    Render: function () {
                        if (!this.status.isOpen) return;


                        this.actionManager.Update();
                        this.physicManager.Update();


                        MethodManager.imgFactoryDraw(this.currentImageObj(), { collisionStatus: this.collisionStatus })


                    }
                },
                objects: {
                    store: [],
                    init: function () {
                        this.status = varableManager.stage.status;
                    },
                    gameStartInit: function () {
                        let currentStageObjs = MethodManager.copyObject(this.status.currentStage.objects);

                        for (var i = 0; i < currentStageObjs.length; i++) {
                            this.store[i] = {};

                            let imgFactoryObj = MethodManager.getImgFactoryObj(currentStageObjs[i]);

                            let collisionStatus = Object.assign({ isground: false, canfall: false }, currentStageObjs[i]);
                            collisionStatus.size = { x: 0, y: 0, width: imgFactoryObj.width, height: imgFactoryObj.height };
                            collisionStatus.body = MethodManager.copyObject(collisionStatus.size);

                            this.store[i].imgFactoryObj = { img: imgFactoryObj.img };
                            this.store[i].collisionStatus = collisionStatus;

                            let obj = this.store[i];

                            BodyManager.insertNewBody(obj.collisionStatus);
                        }

                    },
                    Render: function () {
                        if (!this.status.isOpen) return;

                        for (var i = 0; i < this.store.length; i++) {
                            let obj = this.store[i];

                            MethodManager.imgFactoryDraw(obj.imgFactoryObj, { collisionStatus: obj.collisionStatus })
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

                    let keydown = {
                        right: { flag: false, presstime: 0 },
                        left: { flag: false, presstime: 0 }
                    };
                    window.addEventListener("keydown", function (e) {
                        if (varableManager.stage.status.game.isStart()) {
                            let Chara = varableManager.stage.chara;
                            switch (e.keyCode) {
                                case 39:
                                    if (!Chara.keyDownManager.leftright.getflag(true)) {
                                        Chara.keyDownManager.leftright.initTime(true);
                                        Chara.keyDownManager.leftright.flag(true, true);
                                    }
                                    else {
                                        return;
                                    }
                                    break;
                                case 37:
                                    if (!Chara.keyDownManager.leftright.getflag(false)) {
                                        Chara.keyDownManager.leftright.initTime(false);
                                        Chara.keyDownManager.leftright.flag(false, true);
                                    }
                                    else {
                                        return;
                                    }
                                    break;
                            }




                        }

                        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                            e.preventDefault();
                        }
                    }, false);
                    window.addEventListener("keyup", function (e) {
                        if (varableManager.stage.status.game.isStart()) {
                            let Chara = varableManager.stage.chara;
                            switch (e.keyCode) {
                                case 39:
                                    Chara.keyDownManager.leftright.flag(true, false);
                                    break;
                                case 37:
                                    Chara.keyDownManager.leftright.flag(false, false);
                                    break;
                            }


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