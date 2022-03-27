import {
    requestHostCallback,
    shouldYieldToHost as shouldYield
} from './schedulerHostConfig.js'
/**
 * 调度任务
*/
function scheduleCallback(callback){
    requestHostCallback(callback)
}

export {
    scheduleCallback,
    shouldYield
}