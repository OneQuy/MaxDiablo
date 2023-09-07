// https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors:~:text=Eclipse%20Terminal-,30,-40
export function LogRed(...msg: any[]) {
    const code = process.platform === 'win32' ? 91 : 31

    console.log(`\x1b[${code}m ${msg.join(', ')} \x1b[0m`);
}

export function LogGreen(...msg: any[]) {
    const code = process.platform === 'win32' ? 92 : 32
    console.log(`\x1b[${code}m ${msg.join(', ')} \x1b[0m`);
}

export function LogYellow(...msg: any[]) {
    const code = process.platform === 'win32' ? 93 : 33
    console.log(`\x1b[${code}m ${msg.join(', ')} \x1b[0m`);
}

export function IsParamExist(key: string) {
    return typeof GetParam(key) === 'string'
}

export function GetParam(key: string, asStringOrNumber = true) {
    let value
    key = key.toLowerCase()

    for (let i = 0; i < process.argv.length; i++) {
        const param = process.argv[i]
        const paramLower = param.toLowerCase()

        if (paramLower.startsWith(key + '=')) {
            value = param.substring(key.length + 1)
            break
        }
        else if (key === paramLower) {
            value = ''
            break
        }
    }

    if (value === undefined) // not found
        return undefined;

    if (asStringOrNumber === undefined || asStringOrNumber === true) // return as string
        return value
    else // return as number
        return Number.parseFloat(value)
}

export function GetParamExcludesDefaults(excludeKey: string) {
   for (let i = 0; i < process.argv.length; i++) {
        const cur = process.argv[i].toLowerCase()

        if (cur.includes('.js') ||
            cur.includes('node') ||
            cur === excludeKey)
            continue
        
        return cur;
   }
}