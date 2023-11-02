import { createContext } from "react"

const viet = {
    uploading: 'Đang upload...',
    wait_api: 'Đang phân tích...',
    show_multi_btn: 'Show danh sách ảnh',
    pick_photo: 'Chọn hình',
    pick_photo_btn_guide: '(Có thể chọn nhiều hình)',
    take_cam: 'Chụp hình',
    pick_photo_guide: 'Chọn hình để rate:',
    rate_app: 'Đánh giá app trên Store',
    fail: 'Lỗi',
    list_suit_builds: 'Danh sách build thích hợp',
    events: 'Các sự kiện sắp tới',
    ngon: 'Ngon',
    qua_ngon: 'Quá Ngon',
    startAt: 'Tiếp theo bắt đầu lúc ',
    update: 'Cập nhật',
    ios_updating: 'App đang bảo trì & cập nhật phiên bản mới.',
    vie: 'Tiếng Việt',
    en: 'English',
    err_unique: 'Không thể rate item UNIQUE này. Vui lòng chọn hình khác!',
    
    noti_pp_title: 'Thông báo cho event:',
    only_next_event: 'Chỉ sự kiện tiếp theo',
    all_events: 'Tất cả sự kiện tiếp theo',
    noti_in: 'Thông báo trước',
    turn_off_noti: 'Tắt thông báo',

    perfect: 'TUYỆT PHẨM!',
    very_good: 'RẤT TỐT',
    good: 'TỐT',
    normal: 'BÌNH THƯỜNG',
    trash: 'PHẾ PHẨM',

    cant_rate: 'Lỗi không thể phân tích hình',
    pls_pick_other: 'Vui lòng chụp lại hay chọn ảnh khác!',

    thank_for_update: 'Cảm ơn bạn đã cài đặt / cập nhật app!',
    update_detail: 'Chi tiết cập nhật',

    new_update: 'Có bản cập nhật mới!',
    let_update: 'Vui lòng lên app store cập nhật phiên bản mới nhất gồm:',

    cam_permission: 'Thiếu quyền truy cập Camera!',
    pls_permit: 'Vui lòng cấp quyền truy cập.',

    miss_bracket: 'Vui lòng bật setting hiển thị range [min-max] cho các thông số.\n\n' +
        'Vào option -> chọn thẻ gameplay -> tick vào 2 ô:\n',

    cant_upload: 'Lỗi không thể upload hình để xử lý',
    no_internet: 'Vui lòng kiểm tra internet của bạn.',
}

const eng: Lang = {
    uploading: 'Uploading...',
    wait_api: 'Rating...',
    show_multi_btn: 'Show list images',
    pick_photo: 'Pick photo',
    pick_photo_btn_guide: '(Can pick multi photos)',
    take_cam: 'Camera',
    pick_photo_guide: 'Take a photo to rate:',
    rate_app: 'Rate app on Store',
    fail: 'Failed',
    list_suit_builds: 'Suggest builds',
    events: 'Events',
    ngon: 'Good',
    qua_ngon: 'Very Good',
    startAt: 'Next event starts at ',
    update: 'Update',
    ios_updating: 'The app is under maintaining and updating the new version!',
    vie: 'Tiếng Việt',
    en: 'English',
    err_unique: 'Cant rate this UNIQUE item. Pls select another pic!',

    noti_pp_title: 'Notification for event:',
    only_next_event: 'Only next event',
    all_events: 'All next events',
    noti_in: 'Notify in',
    turn_off_noti: 'Turn off notification',

    perfect: 'PERFECT!',
    very_good: 'VERY GOOD',
    good: 'GOOD',
    normal: 'NORMAL',
    trash: 'TRASH ITEM',

    cant_rate: 'Can not rate!',
    pls_pick_other: 'Please pick another pic!',

    thank_for_update: 'Thanks for install / update the app!',
    update_detail: 'Release note',

    new_update: 'New update!',
    let_update: 'Please update the app for the latest version and enjoy new features:',

    cam_permission: 'No permission to access your camera!',
    pls_permit: 'Please accept the permission.',

    miss_bracket: 'Please turn on the setting of showing the range [min-max] of the opts.\n\n' +
        'Go to Option -> Select Gameplay -> Tick these 2 options:\n',

    cant_upload: 'Can not upload the pic to server',
    no_internet: 'Please check your internet',


}

export type Lang = typeof viet

export const GetLang = (isViet: boolean): Lang => isViet ? viet : eng

export const LangContext = createContext(GetLang(true))