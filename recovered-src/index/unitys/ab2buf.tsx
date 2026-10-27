export const ab2Buf = (ab: ArrayBuffer) => {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Int8Array(ab)

    for (let i = 0; i < buf.length; i++) {
        buf[i] = view[i]
    }
    return buf
}

export const num2Byte4 = (num: number) => {
    if (num > 0xffffffff) return [0, 0, 0, 0]
    else return [(num & 0xffffffff) >> 24, (num & 0xffffff) >> 16, (num & 0xffff) >> 8, num & 0xff]
}

export const byte42Num = (arr: number[]) => {
    let tmpNum: number = 0
    if (arr.length === 4) {
        tmpNum = arr[0] << 24 | arr[1] << 16 | arr[2] << 8 | arr[3]
    }
    return tmpNum;
}