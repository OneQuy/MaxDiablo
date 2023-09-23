import { Dimensions } from "react-native";

export const windowSize = Dimensions.get('window')

export enum FontSize {
    Small = 12,
    Normal = 15,
    Big = 20
}

export enum FontWeight {
    Bold = 'bold',
    B500 = '500'
}

export enum Outline {
    Gap = 10,
    Margin = 10
}