let scheduleHostCallback = null;
const messageChannel = new MessageChannel();
messageChannel.port1.onmessage = performWorkUntilDeadline;
let deadline = 0;
let yieldInterval = 5;//每一帧五毫秒
let taskTimeoutID = -1;
function getCurrentTime() {
    return performance.now();
}

function performWorkUntilDeadline() {
    let currentTime = getCurrentTime();//获取当前时间
    deadline = currentTime + yieldInterval;//计算截止时间
    const hasMoreWork = scheduleHostCallback();//如果返回true，还得继续接着干！
    if (hasMoreWork) {//继续工作
        messageChannel.port2.postMessage(null);
        // requestAnimationFrame(performWorkUntilDeadline)
    }
}
function requestHostCallback(callback) {
    scheduleHostCallback = callback;
    //会向宏任务队列添加
    messageChannel.port2.postMessage(null);
    // requestAnimationFrame(performWorkUntilDeadline)
}

function shouldYieldToHost() {
    let currentTime = getCurrentTime();//获取当前时间
    return currentTime >= deadline;//如果当前时间大于截止时间了，说明到期了，时间片已经用完了，需要返回true，放弃当前任务
}

function requestHostTimeout(callback, ms) {
    taskTimeoutID = setTimeout(() => {
        callback(getCurrentTime());
    }, ms);
};

export {
    requestHostCallback,
    shouldYieldToHost,
    getCurrentTime,
    requestHostTimeout
}