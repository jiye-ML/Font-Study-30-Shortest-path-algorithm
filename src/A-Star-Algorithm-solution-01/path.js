(function(window, undefined){

    'use strict';

    var Path = null;

    Path = function(){
        return new Path.fn.init();
    };

    Path.fn = Path.prototype = {
        constructor: Path,
        init: function(){
            this.ID         = 'Path';
            this.NAME       = 'Path';
        }
    };

    Path.fn.init.prototype = Path.fn;

    // 定义A*算法里面的元素 ==START==
    var Element = function() {
        if (!(this instanceof Element)) {
            return new Element();
        }

        // 记录元素的状态 0 标识空白，可被放置
        this.status = 0;

        // 定义元素四周的元素
        this.right = this.left = this.top = this.bottom = this.leftTop = this.rightTop = this.leftBottm = this.rightBottom = null;

        var option = arguments[0];
        if (option && option.afterCreate) {
            option.afterCreate.call(this);
        }
    };

    // 设置Element的set，get方法
    var methods = ["top", "bottom", "left", "right",  
    "leftTop", "rightTop", "leftBottm", "rightBottom", "status", "x", "y"];
    var defineSetGetMethod = function(fn, methods) {
        var fnPrototype = fn.prototype;
        for (var i = 0; i < methods.length; i++) {
            var methodName = methods[i].charAt(0).toLocaleUpperCase() + methods[i].substring(1);
            fn.prototype['set' + methodName] = new Function("value", "this." + methods[i] + "= value;");
            fn.prototype['get' + methodName] = new Function("return this." + methods[i]+";");
            fn.prototype['toString'] = new Function('return "matrix-item-" + this.x + "-" + this.y;');
        }
    };
    defineSetGetMethod(Element, methods);

    //扩展函数的实例方法
    var extend = function(fn, option) {
        var fnPrototype = fn.prototype;
        for (var i in option) {
            fnPrototype[i] = option[i];
        }
    };

    extend(Element, {
        atLeft : function(element) {
            return this.getX() < element.getX();
        },
        atTop : function(element) {
            return this.getY() < element.getY();
        },
        atRight : function(element) {
            return this.getX() > element.getX();
        },
        atBottom : function(element) {
            return this.getY() > element.getY();
        },
        atLeftTop : function(element) {
            return this.getX() < element.getX() && this.getY() < element.getY();
        },
        atRightTop : function(element) {
            return this.getX() > element.getX() && this.getY() < element.getY();
        },
        atLeftBottm : function(element) {
            return this.getX() < element.getX() && this.getY() > element.getY();
        },
        atRightBottom : function(element) {
            return this.getX() > element.getX() && this.getY() > element.getY();
        },
        isSelf : function(element) {
            return this == element;
        }
    });

    // 定义A*算法里面的元素 ==END==

    /**
     * 创建矩阵项集合
     * @param row       矩阵行
     * @param col       矩阵咧
     * @param option    参数
     * @returns {Array} 返回矩阵项集合
     */
    Path.fn.createElements = function(row, col, option) {
        var eArr = [];  // 存放矩阵项的数组
        //  1、初始化二维数组
        for (var i = 0; i < row; i++) {
            for ( j = 0; j < col; j++) {
                eArr[i] || (eArr[i] = []);
                var element = new Element(option);
                element.setX(i);
                element.setY(j);
                eArr[i][j] = element;
            }
        }

        // 2、遍历二维数组，对每一项的上下左右位置进行判断并设置
        for (var i = 0; i < row; i++) {
            for ( j = 0; j < col; j++) {
                var item    = eArr[i][j];

                // 上下左右
                var left    = (j > 0) ? eArr[i][j - 1] : null;
                var right   = (j + 1 < col) ? eArr[i][j + 1] : null;
                var top     = (i > 0) ? eArr[i-1][j] : null;
                var bottom  = (i + 1 < row) ? eArr[i+1][j] : null;
                
                // 四个角
                var left_top = (j > 0 && i > 0) ? eArr[i-1][j-1] : null;
                var right_top = (j + 1 < col && i > 0) ? eArr[i-1][j+1] : null;
                var left_bottom = (j > 0 && i + 1 < row) ? eArr[i+1][j-1] : null;
                var right_bottom = (j + 1 < col && i + 1 < row) ? eArr[i+1][j+1] : null;

                item.setLeft(left);
                item.setRight(right);
                item.setBottom(bottom);
                item.setTop(top);

                item.setLeftTop(left_top);
                item.setRightTop(right_top);
                item.setLeftBottm(left_bottom);
                item.setRightBottom(right_bottom);
                
            }
        }
        return eArr;
    };

    /**
     * 寻找起点到终点的最短路径
     * @param element 起点
     * @param target 终点
     * @param switchTag true则返回可到达的所有区域
     * @returns {*}
     */
    Path.fn.getPath = function(element, target) {

        // 记录element可到达区域对应的路径
        var result = {
            arrivePath : {}
        };

        if (element == target) {
            return result;
        }

        // 设置查找的方向
        var dirArr = ["Top", "Right", "Bottom", "Left", "LeftTop", "RightTop", "LeftBottm", "RightBottom"];

        // 递归查找元素elements四周可到达的元素
        var addPath = function(elements, target) {
            if (!elements || !elements.length) {
                return;
            }

            // 缓存elements中元素周围可到达的元素
            var nearElements = [];
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                for (var j = 0; j < dirArr.length; j++) {
                    var dir = dirArr[j];
                    var nearElement = element["get"+dir]();
                    // 遇到障碍则中断
                    if (!nearElement || (nearElement != target && nearElement.getStatus() > 0) || result.arrivePath[nearElement]) {
                        continue;
                    }
                    nearElements.push(nearElement);
                    var lastPath = result.arrivePath[element];
                    if (!lastPath) {
                        lastPath = [];
                    }
                    result.arrivePath[nearElement] = [].concat(lastPath);
                    result.arrivePath[nearElement].push(nearElement);
                    if (target && target == nearElement) {
                        break;
                        return;
                    }
                }
            }
            addPath(nearElements, target);
        };
        addPath([element], target);
        result.arriveTargetPath = result.arrivePath[target];
        if (target) {
            var newJson = {};
            newJson[target] = result.arrivePath[target] || [];
            return newJson;
        } else {
            return result.arrivePath;
        }
    };

    window.Path = Path;

})(window);