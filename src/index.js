import {
    scheduleCallback,
    shouldYield
} from './scheduler/index.js';
let result = 0;
let i = 0;
function calcuate() {
    //如果任务没有结束，浏览器分配的时间片已经到期了，就会放弃本任务的执行！
    for (; i < 10000 && (!shouldYield()); i++) {
        result += 1;
    }

    //如果任务没有完成，返回函数本身，如果已经完成，那么打印结果！
    if (i < 10000) {
        return calcuate;
    } else {
        console.log(result);
        return null;
    }
}
scheduleCallback(calcuate);

let result2 = 0;
let i2 = 0;
function calcuate2() {
    //如果任务没有结束，浏览器分配的时间片已经到期了，就会放弃本任务的执行！
    for (; i2 < 20000 && (!shouldYield()); i2++) {
        result2 += 1;
    }

    //如果任务没有完成，返回函数本身，如果已经完成，那么打印结果！
    if (i2 < 20000) {
        return calcuate2;
    } else {
        console.log(result2);
        return null;
    }
}

scheduleCallback(calcuate2);