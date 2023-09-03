export enum SlotName {
    Helm = 'Helm',
    ChestArmor = 'Chest Armor',
    Gloves = 'Gloves',
    Pants = 'Pants',
    Boots = 'Boots',
    Amulet = 'Amulet',
    Ring = 'Ring',
    H1Weapon = '1h Weapon',
    H2Weapon = '2h Weapon',
    Offhand = 'Offhand',
    Shield = 'Shield',
}

export type Stat = {
    name: string,
    value: number
}

export type SlotCard = {
    slotName: SlotName,
    stats: Stat[]
}

