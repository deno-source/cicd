import { scheduleCallback } from './scheduler/index.js';
let result = 0;
let i = 0;
function calcuate() {
    for (; i < 10000000; i++) {
        result += 1;
    }
    console.log(result)
}


scheduleCallback(calcuate);