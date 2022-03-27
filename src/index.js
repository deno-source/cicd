import {
    scheduleCallback,
    shouldYield
} from './scheduler/index.js';
let result = 0;
let i = 0;
function calcuate() {
    //如果任务没有结束，浏览器分配的时间片已经到期了，就会放弃本任务的执行！
    for (; i < 1000000000 && (!shouldYield()); i++) {
        result += 1;
    }

    //如果任务没有完成，返回函数本身，如果已经完成，那么打印结果！
    if (i < 1000000000) {
        return calcuate;
    }else{
        console.log(result);
        return null;
    }
}


scheduleCallback(calcuate);