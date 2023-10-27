import { createContext } from "react"

const viet = {
    uploading: 'Đang upload...',
    wait_api: 'Đang phân tích...',
    show_multi_btn: 'Show danh sách ảnh',
    pick_photo: 'Chọn hình',
    take_cam: 'Chụp hình',
    pick_photo_guide: 'Chọn hình để rate:',
    rate_app: 'Đánh giá app trên Store',
    fail: 'Lỗi',
    list_suit_builds: 'Danh sách build thích hợp',
    events: 'Các sự kiện sắp tới',
    ngon: 'Ngon',
    qua_ngon: 'Quá Ngon',
    startAt: 'Bắt đầu lúc: ',

    perfect: 'TUYỆT PHẨM!',
    very_good: 'RẤT TỐT',
    good: 'TỐT',
    normal: 'BÌNH THƯỜNG',
    trash: 'RÁC RƯỞI',

    cant_rate: 'Lỗi không thể phân tích hình',
    pls_pick_other: 'Vui lòng chụp lại hay chọn ảnh khác!',

    thank_for_update: 'Cảm ơn bạn đã cài đặt / cập nhật app!',
    update_detail: 'Chi tiết cập nhật',
}

const eng: Lang = {
    uploading: 'Uploading...',
    wait_api: 'Rating...',
    show_multi_btn: 'Show list images',
    pick_photo: 'Pick photo(s)',
    take_cam: 'Camera',
    pick_photo_guide: 'Take a photo to rate:',
    rate_app: 'Rate app on Store',
    fail: 'Failed',
    list_suit_builds: 'Suggest builds',
    events: 'Events',
    ngon: 'Good',
    qua_ngon: 'Very Good',
    startAt: 'Start at: ',

    perfect: 'PERFECT!',
    very_good: 'VERY GOOD',
    good: 'GOOD',
    normal: 'NORMAL',
    trash: 'TRASH',

    cant_rate: 'Can not rate!',
    pls_pick_other: 'Please pick another pic!',

    thank_for_update: 'Thanks for install / update the app!',
    update_detail: 'Release note',
}

export type Lang = typeof viet

export const GetLang = (isViet: boolean): Lang => isViet ? viet : eng

export const LangContext = createContext(GetLang(true))