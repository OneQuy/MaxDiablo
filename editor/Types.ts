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