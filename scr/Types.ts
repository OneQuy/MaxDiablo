export enum SlotName {
    None = 'None',

    Helm = 'Helm',
    ChestArmor = 'Chest Armor',
    Gloves = 'Gloves',
    Pants = 'Pants',
    Boots = 'Boots',
    Amulet = 'Amulet',
    Ring = 'Ring',
    Wand = 'Wand',
    Focus = 'Focus',
    Shield = 'Shield',
    Sword = 'Sword',
    Dagger = 'Dagger',
    Crossbow = 'Crossbow',
    TwoHandedMace = 'Two-Handed Mace',
    TwoHandedSword = 'Two-Handed Sword',
    TwoHandedAxe = 'Two-Handed Axe',
    Axe = 'Axe',
    Totem = 'Totem',
    Staff = 'Staff',
    Mace = 'Mace',
    Bow = 'Bow',
    Polearm = 'Polearm',
    Scythe = 'Scythe',

    H1Weapon = '1h Weapon',
    H2Weapon = '2h Weapon',
    Offhand = 'Offhand',

    // Note when add new:
    // + if name is too long, add too extract slot name hardcoded (scr/OCRUtils.tsx) 
    // + add to ConvertSlotNameToShortSlotName
}

export type Stat = {
    name: string,
    value: number,
    min: number,
    max: number,
    isPercent: boolean
}

export type SlotCard = {
    slotName: SlotName,
    itemPower: number,
    stats: Stat[]
}

export type Build = {
    name: string,
    slots: SlotCard[],
}

export type Tier = {
    name: string,
    builds: Build[]
}

// class data ================

export enum ClassName {
    AllClasses = 'All Classes',
    Barbarian = 'Barbarian',
    Druid = 'Druid',
    Necromancer = 'Necromancer',
    Rogue = 'Rogue',
    Sorcerer = 'Sorcerer',
}

export type Classs = {
    name: ClassName,
    stats: Stat[]
}

export type SlotOfClasses = {
    name: SlotName,
    classes: Classs[]
}

// ignored stat ============

export type IgnoredStatsOfSlot = {
    name: SlotName,
    statNames: string[]
}

// unique ============

export type UniqueBuild = {
    name: string,
    upperSlotNames: string[],
}

// others ============

export type GoodStatsAlternative = {
    slotNames: SlotName[],
    stats: string[]
}

export type StatForRatingType = [Stat, Classs | undefined, Stat | undefined, number] // user stat, class, class data stat, rate score

export type RateResult = {
    score: number,
    text: string,
    color: string,
    statsForRating: StatForRatingType[]
}

export type SuitBuildType = [Tier | undefined, Build, SlotCard | undefined, number | undefined] // user stat, class, class data stat, rate score

export type Event = {
    name: string
    originTime: number,
    intervalInMinute: number
}

export type ImgItemData = {
    uri: string,
    slot?: SlotCard | undefined,
    errorAlert?: [string, string],
    suitBuilds?: SuitBuildType[],
    rateResult?: RateResult,
    fileID: string,

    /**
     * @undefined: not called api yet
     * @empty string: got api result but has no text
     * @string: api result text
     */
    ocrResultTxt?: string | undefined,
}

export enum NotificationState {
    Off,
    Once,
    All,
}

export type NotificationData = {
    nameEvent: string
    state: NotificationState,
    lastSetTimeForOnceMode: number,
    comingNotiTimeInMinutes: number,
}