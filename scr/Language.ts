import { createContext } from "react"

const viet = {
    uploading: 'Đang upload...',
    wait_api: 'Đang phân tích...',
    show_multi_btn: 'Show danh sách ảnh',
    fail: 'Lỗi',
    perfect: 'TUYỆT PHẨM!',
    very_good: 'RẤT TỐT',
    good: 'TỐT',
    normal: 'BÌNH THƯỜNG',
    trash: 'RÁC RƯỞI',
}

const eng: Lang = {
    uploading: 'Uploading...',
    wait_api: 'Rating...',
    show_multi_btn: 'Show list images',
    fail: 'Failed',
    perfect: 'PERFECT!',
    very_good: 'VERY GOOD',
    good: 'GOOD',
    normal: 'NORMAL',
    trash: 'TRASH',
}

export type Lang = typeof viet

export const GetLang = (isViet: boolean) : Lang => isViet ? viet : eng

export const LangContext = createContext(GetLang(false))