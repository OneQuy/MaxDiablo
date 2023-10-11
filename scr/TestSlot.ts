import { SlotCard, SlotName } from "./Types"

const testSlot: SlotCard = 
{
    slotName: SlotName.Ring,
    itemPower: 700,
    stats: [
        {
            name: 'Vulnerable Damage',
            value: 13,
            min: 7,
            max: 14,
            isPercent: true
        },

        {
            name: 'Damage to Close Enemies',
            value: 22,
            min: 16.5,
            max: 23.5,
            isPercent: true
        },

        {
            name: 'Critical Strike Chance',
            value: 4.6,
            min: 1.8,
            max: 5,
            isPercent: true
        },

        {
            name: 'Barrier Generation',
            value: 12,
            min: 7,
            max: 14,
            isPercent: true
        }
    ]
}

export const forceSlot: SlotCard | undefined = testSlot
