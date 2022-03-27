import {
    requestHostCallback,
    shouldYieldToHost as shouldYield
} from './schedulerHostConfig.js'
let taskQueue = [];
let currentTask;
/**
 * 调度任务
*/
function scheduleCallback(callback) {
    taskQueue.push(callback);
    requestHostCallback(flushWork);
}

function flushWork() {
    return workLoop();
}

function workLoop() {
    currentTask = taskQueue[0];
    while (currentTask) {
        if (shouldYield()) {//如果时间片到期了，退出循环
            break;
        }
        const continuationCallback = currentTask();
        if (typeof continuationCallback == 'function') {
            currentTask = continuationCallback;
        } else {
            taskQueue.shift();//移除索引为0的元素
        }
        currentTask = taskQueue[0];
    }
    return currentTask;
}
export {
    scheduleCallback,
    shouldYield
}