//In ms
export async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function getDuration(start, end){
    const elapsedMs = end - start;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(elapsedSec / 60);
    const seconds = elapsedSec % 60;
    let string = toString(minutes) + "min " + toString(seconds) + "sec";
    return string;
}