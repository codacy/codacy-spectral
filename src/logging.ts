export function log(msg: string) {
    if (process.env.DEBUG) console.debug(msg)
}

export function logEach<T>(arr: Array<T>, msg: (value: T) => string) {
    if (process.env.DEBUG) arr.forEach(value => console.debug(msg(value)))
}
