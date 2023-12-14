export function Throttle(func: () => void, interval: number) {
    let lastExecutionTime = 0;
    let timeout: NodeJS.Timeout

    return function () {
        const now = Date.now();
        const elapsedTime = now - lastExecutionTime;

        if (elapsedTime >= interval) {
            func();
            lastExecutionTime = now;
            
            // console.log('excuted');
            
        } else {
            // If there's a pending timeout, clear it
            clearTimeout(timeout);
            
            // console.log('ignore', interval - elapsedTime);
            
            // Schedule a new timeout
            timeout = setTimeout(() => {
                func()
                lastExecutionTime = Date.now();
            }, interval - elapsedTime);
        }
    };
}
