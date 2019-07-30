/**
 * reference https://www.jianshu.com/p/a61dbc74770e
 * 
 * 通过A星算法实现从起点到终点的最短路径的查询，
 * 接口 run(width, height, src, dest)
 *               width: 图像宽
 *               height: 图像高度
 *               src:  object对象，存储起点的坐标，如 {value: [3, 1]}
 *               dest: object对象，存储终点坐标： 如 {value: [15, 20]}
 *       说明：此处因为后面需要给每个点添加
 *                                      num属性来判断，下一个点选择该点的代价，
 *                                      parent：方便回溯路径
 * 
 * 
 * 
 * 运行完成后，closeNodeArray中存储，从起始点到目标点的过程中访问过的所有点，
 * 如果想要最短路径，可以通过showLine函数来得到，
 * 
 * 
 * 为了验证本js，可以新建一个html，然后直接引入本js，通过页面查看path结果即可
 * path, 本次结果在本js文件的最后说明
 * 
 */

let nextReachablePoints = [];
// closeNodeArray 储存不可选的节点
let closeNodeArray = [];

function EuclideanDistance(src, dest) {
    let a = Distance_X(src, dest);
    let b = Distance_Y(src, dest);
    return Math.sqrt(a * a + b * b);
}

function Distance_X(src, dest) {
    return Math.abs(src.value[0] - dest.value[0]);
}

function Distance_Y(src, dest) {
    return Math.abs(src.value[1] - dest.value[1]);
}

// 从初始节点经过节点node后，到达目标节点的总代价
function f(node, begin, end) {
    return g(node, begin) + h(node, end);
}

// 从初始节点到节点node的代价
function g(node, begin) {
    return EuclideanDistance(node, begin);
}

// 从节点node到目标节点的代价
function h(node, end) {
    return EuclideanDistance(node, end);
}

function CompareArrayForEquel(a, b) {

    if (a.length !== b.length) 
        return false

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true;
}

// 找到当前路径元素的下一步可选路径，共有8种选择
function findNextReachablePoints(width, height, now, src, end) {
    let result = [];

    // 1. 将所有可以访问的点加入result里面
    for (let i = 0; i < height; ++i) {
        for (let j = 0; j < width; ++j) {
            if (nodeCanReachable([i, j])) {
                // 这里存储为对象是因为后面需要num和parent属性，如果直接将值传入，不能添加
                let a = new Object;
                a.value = [i, j];
                result.push(a);
            }
        }
    }
    
    function nodeCanReachable(no) {
         // 1. 判断no是不是在不可达节点集合中
        for (let i = 0; i < closeNodeArray.length; i++) {
            if (CompareArrayForEquel(closeNodeArray[i].value, no)) {
                return false;
            }
        }
        // 2. 判断no是不是在已经访问的节点集合中
        for (let i = 0; i < nextReachablePoints.length; i++) {
            if (CompareArrayForEquel(nextReachablePoints[i].value, no)) {
                return false;
            }
        }
        return true;
    }
     
    // 2. 在可以访问的点中找到相邻的点
    for (let i = 0; i < result.length; i++) {
        //  2.1 以now节点为中心，在3x3的区域内的其他8个点有可能为可达点
        if (EuclideanDistance(now, result[i]) < 2) {
            // 用于优先队列的排序，选择估价最小的点最为下一次访问的点
            result[i].num = f(result[i], src, end);
            // 该搜索过程的全部信息就存储在closeNodeArray数组, 但由于障碍物的存在，closeNodeArray的路径可能会很长，
            // 想要清晰的展示出搜索过程，展示closeNodeArray不是好方法。
            // 可以利用回溯，closeNodeArray的最后一位是目标点，由目标点回溯到上一步路径元素，
            // 然后由该路径元素回溯到它的上一步路径元素，直到回溯到起始点，该回溯过程就可以表示搜索过程。
            result[i].parent = now;
            // 表示这些点可以作为下一次访问的点集
            nextReachablePoints.push(result[i]);
        }
    }
}

function TagNodeToClose(now) {
    closeNodeArray.push(now);
}

// 每次从优先队列中提出代价最小的点作为下一个点访问，递归直到找到目标节点
function _run(width, height, src, dest) {
    /**
     * width, height: 表示图像的尺寸
     * src  为object对象，存储起始节点 如 {value: [6, 3]}
     * dest 为object对象，存储目标节点 如 {value: [12, 18]} 
     * 
     */

    // 从可以访问的点集中取出一个，因为已经通过num的值进行了排序，这里相当于一个优先队列
    let now = nextReachablePoints.shift();

    if (CompareArrayForEquel(now.value, dest.value)) return ;

    TagNodeToClose(now);
    findNextReachablePoints(width, height, now, src, dest);
    // 对于所有可以下一次访问的节点，通过加入的前后顺序排序， 可以任务nextReachablePoints为一个优先队列，通过num进行先后访问
    nextReachablePoints.sort(function(left, right) { return left.num - right.num });

    _run(width, height, src, dest);
}



// 接口的入口函数
function run(width, height, src, dest) {
    /**
     * width, height: 表示图像的尺寸
     * src  为object对象，存储起始节点 如 {value: [6, 3]}
     * dest 为object对象，存储目标节点 如 {value: [12, 18]} 
     */

    // 起始节点已经访问
    nextReachablePoints.push(src);

    _run(width, height, src, dest);
}





function Demo() {
    // 构建图
    height = 20;
    width = 20;

    var src = [6, 3];
    var dest = [12, 18];

    let srcObj = new Object;
    srcObj.value = src;
    let destObj = new Object;
    destObj.value = dest;

    run(width, height, srcObj, destObj);

    path = showLine(srcObj, destObj);
}

function showLine(src, dest) {
    let result =  [];
    let lastLi = closeNodeArray.pop();
    findParent(lastLi);
    
    // 查找li的父节点，回溯到开始节点，利用result保存中间的节点
    function findParent(li) {
        // unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
        result.unshift(li)
        if (CompareArrayForEquel(li.parent.value, src.value)) {
            return ;
        }
        findParent(li.parent);
    }
    return result;
}

Demo()





/*******
 * 

 * 
 * (14) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
0:
num: 16.231546211727817
parent: {value: Array(2)}
value: (2) [6, 4]
__proto__: Object
1:
num: 16.16445625468391
parent: {value: Array(2), num: 16.231546211727817, parent: {…}}
value: (2) [7, 5]
__proto__: Object
2:
num: 16.162277660168378
parent: {value: Array(2), num: 16.16445625468391, parent: {…}}
value: (2) [7, 6]
__proto__: Object
3:
num: 16.176835865719205
parent: {value: Array(2), num: 16.162277660168378, parent: {…}}
value: (2) [8, 7]
__proto__: Object
4:
num: 16.15549442140351
parent: {value: Array(2), num: 16.176835865719205, parent: {…}}
value: (2) [8, 8]
__proto__: Object
5:
num: 16.173413122132864
parent: {value: Array(2), num: 16.15549442140351, parent: {…}}
value: (2) [8, 9]
__proto__: Object
6:
num: 16.15977685118144
parent: {value: Array(2), num: 16.173413122132864, parent: {…}}
value: (2) [9, 10]
__proto__: Object
7:
num: 16.15977685118144
parent: {value: Array(2), num: 16.15977685118144, parent: {…}}
value: (2) [9, 11]
__proto__: Object
8:
num: 16.173413122132864
parent: {value: Array(2), num: 16.15977685118144, parent: {…}}
value: (2) [10, 12]
__proto__: Object
9:
num: 16.15549442140351
parent: {value: Array(2), num: 16.173413122132864, parent: {…}}
value: (2) [10, 13]
__proto__: Object
10:
num: 16.176835865719205
parent: {value: Array(2), num: 16.15549442140351, parent: {…}}
value: (2) [10, 14]
__proto__: Object
11:
num: 16.162277660168378
parent: {value: Array(2), num: 16.176835865719205, parent: {…}}
value: (2) [11, 15]
__proto__: Object
12:
num: 16.16445625468391
parent: {value: Array(2), num: 16.162277660168378, parent: {…}}
value: (2) [11, 16]
__proto__: Object
13:
num: 16.231546211727817
parent: {value: Array(2), num: 16.16445625468391, parent: {…}}
value: (2) [12, 17]
__proto__: Object
length: 14
__proto__: Array(0)
 */