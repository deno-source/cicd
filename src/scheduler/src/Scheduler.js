import { requestHostCallback, shouldYieldToHost as shouldYield, getCurrentTime, requestHostTimeout } from './SchedulerHostConfig.js';
import { push, pop, peek } from './SchedulerMinHeap.js';
import { ImmediatePriority, UserBlockingPriority, NormalPriority, LowPriority, IdlePriority } from './SchedulerPriorities.js';
// 不同优先级对应的不同的任务过期时间间隔
let maxSigned31BitInt = 1073741823;
let IMMEDIATE_PRIORITY_TIMEOUT = -1;//立即执行的优先级，级别最高
let USER_BLOCKING_PRIORITY_TIMEOUT = 250;//用户阻塞级别的优先级
let NORMAL_PRIORITY_TIMEOUT = 5000;//正常的优先级
let LOW_PRIORITY_TIMEOUT = 10000;//较低的优先级
let IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;//优先级最低，表示任务可以闲置
//已经可以开始执行队列
let taskQueue = [];
//尚未可以开始执行队列
let timerQueue = [];
let currentTask;
//下一个任务ID编号
let taskIdCounter = 1;
/**
 * 调度一个工作
 * @param {*} callback 要执行的工作
 */
function scheduleCallback(priorityLevel, callback, options) {
    // 获取当前时间，它是计算任务开始时间、过期时间和判断任务是否过期的依据
    let currentTime = getCurrentTime();
    // 确定任务开始时间
    let startTime;
    if (typeof options === 'object' && options !== null) {
        var delay = options.delay;
        if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
        } else {
            startTime = currentTime;
        }
    } else {
        startTime = currentTime;
    }
    // 计算过期时间
    let timeout;
    switch (priorityLevel) {
        case ImmediatePriority://1
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;//-1
            break;
        case UserBlockingPriority://2
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;//250
            break;
        case IdlePriority://5
            timeout = IDLE_PRIORITY_TIMEOUT;//1073741823
            break;
        case LowPriority://4
            timeout = LOW_PRIORITY_TIMEOUT;//10000
            break;
        case NormalPriority://3
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT;//5000
            break;
    }
    //计算超时时间
    let expirationTime = startTime + timeout;
    //创建新任务
    let newTask = {
        id: taskIdCounter++,//任务ID
        callback,//真正的任务函数
        priorityLevel,//任务优先级，参与计算任务过期时间
        startTime,
        expirationTime,//表示任务何时过期，影响它在taskQueue中的排序
        //为小顶堆的队列提供排序依据
        sortIndex: -1
    };
    if (startTime > currentTime) {
        newTask.sortIndex = startTime;
        push(timerQueue, newTask);
        if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            requestHostTimeout(handleTimeout, startTime - currentTime);
        }
    } else {
        newTask.sortIndex = expirationTime;
        //把此工作添加到任务队列中
        push(taskQueue, newTask);
        //开始调度flushWork
        requestHostCallback(flushWork);
    }
}
/**
* 处理超时任务
* @param {*} currentTime 
*/
function handleTimeout(currentTime) {
    advanceTimers(currentTime);
    if (peek(taskQueue) !== null) {
        requestHostCallback(flushWork);
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
}
function advanceTimers(currentTime) {
    let timer = peek(timerQueue);
    while (timer !== null) {
        if (timer.callback === null) {
            pop(timerQueue);
        } else if (timer.startTime <= currentTime) {
            pop(timerQueue);
            timer.sortIndex = timer.expirationTime;
            push(taskQueue, timer);
        } else {
            return;
        }
        timer = peek(timerQueue);
    }
}
/**
 * 清空任务队列
 * @returns 队列中是否还有任务
 */
function flushWork(initialTime) {
    return workLoop(initialTime);
}
/**
 * 清空任务队列
 * @returns 队列中是否还有任务
 */
function workLoop(initialTime) {
    //当前时间
    let currentTime = initialTime;
    //取出第一个任务
    currentTask = peek(taskQueue);
    //如果任务存在
    while (currentTask) {
        //如果当前任务的过期时间大于当前时间,并且当前的时间片到期了,退出工作循环
        if (currentTask.expirationTime > currentTime && shouldYield()) {
            break;
        }
        //执行当前的工作
        //const continuationCallback = currentTask();
        const callback = currentTask.callback;
        if (typeof callback === 'function') {
            currentTask.callback = null;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            //如果返回函数说明任务尚未结束,下次还执行它
            if (typeof continuationCallback === 'function') {
                //currentTask = continuationCallback;
                currentTask.callback = continuationCallback;
            } else {
                //否则表示此任务执行结束，可以把此任务移除队列
                //taskQueue.shift();
                pop(taskQueue);
            }
        } else {
            pop(taskQueue);
        }
        //还取第一个任务
        currentTask = peek(taskQueue);
    }
    if (currentTask !== null) {
        return true;
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
        return false;
    }
}

export {
    scheduleCallback,
    shouldYield,
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    IdlePriority,
    LowPriority
}