const viet = {
    uploading: 'Đang upload...',
    wait_api: 'Đang phân tích...'
}


const eng: Lang = {
    uploading: 'Uploading...',
    wait_api: 'Rating...',
}

export type Lang = typeof viet

export const GetLang = (isViet: boolean) : Lang => isViet ? viet : eng