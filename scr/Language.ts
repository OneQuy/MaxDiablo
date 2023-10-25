const viet = {
    uploading: 'Đang upload...',
    wait_api: 'Đang phân tích...',
    show_multi_btn: 'Show danh sách ảnh'
}


const eng: Lang = {
    uploading: 'Uploading...',
    wait_api: 'Rating...',
    show_multi_btn: 'Show list images',
}

export type Lang = typeof viet

export const GetLang = (isViet: boolean) : Lang => isViet ? viet : eng