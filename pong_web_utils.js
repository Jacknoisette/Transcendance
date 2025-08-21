//In ms
export async function sleep(time) {
    console.log("sleep");
    return new Promise(resolve => setTimeout(resolve, time));
}