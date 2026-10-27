export const buf2NumArr = (buf: Buffer) => {
    const arr = new Array<number>()
    buf.map(v => arr.push(v))
    return arr
}