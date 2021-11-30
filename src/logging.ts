export function debug(msg: string) {
    if (process.env.DEBUG) console.debug(msg)
}

export function debugEach<T>(arr: Array<T> | undefined, msg: (value: T) => string) {
    if (process.env.DEBUG) arr?.forEach(value => console.debug(msg(value)))
}
