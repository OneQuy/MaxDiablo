export enum SlotName {
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
    Axe = 'Axe',
    Totem = 'Totem',
    Staff = 'Staff',
    Mace = 'Mace',
    Bow = 'Bow',
    Polearm = 'Polearm',
    Scythe = 'Scythe',
} // Note when add new: if name is too long, add too extract slot name hardcoded (scr/OCRUtils.tsx) 

export type Stat = {
    name: string,
    value: number
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