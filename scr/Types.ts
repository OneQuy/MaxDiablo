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
    stats: Stat[]
}

