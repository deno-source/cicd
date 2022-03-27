import {
    scheduleCallback,
    shouldYield
} from './scheduler/index.js';
import { ImmediatePriority, UserBlockingPriority, NormalPriority, LowPriority, IdlePriority } from './scheduler/src/SchedulerPriorities.js';
let result = 0;
let i = 0;
function calcuate(didTimeout) {
    //如果任务没有结束，浏览器分配的时间片已经到期了，就会放弃本任务的执行！
    for (; i < 1000 && (!shouldYield())|| didTimeout; i++) {
        result += 1;
    }

    //如果任务没有完成，返回函数本身，如果已经完成，那么打印结果！
    if (i < 1000) {
        return calcuate;
    } else {
        console.log('result1',result);
        return null;
    }
}
scheduleCallback(LowPriority, calcuate);

let result2 = 0;
let i2 = 0;
function calcuate2(didTimeout) {
    //如果任务没有结束，浏览器分配的时间片已经到期了，就会放弃本任务的执行！
    for (; i2 < 1000 && (!shouldYield())|| didTimeout; i2++) {
        result2 += 1;
    }

    //如果任务没有完成，返回函数本身，如果已经完成，那么打印结果！
    if (i2 < 1000) {
        return calcuate2;
    } else {
        console.log('result2',result2);
        return null;
    }
}

scheduleCallback(ImmediatePriority, calcuate2);