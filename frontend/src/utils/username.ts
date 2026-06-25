import type { ProfileType } from "../types/types";

export const usernameOutput = (name: ProfileType): string => {
    const username = name
    if (!username) throw new Error('Error of reading name')
    if (name.name.split(' ').length === 1) {
        return name.name.charAt(0)
    } else {
        const abbreviation: string[] = [];
        for (const word of name.name.split(' ')) {
            abbreviation.push(word.charAt(0))
        }
        return abbreviation.join('')
    }
}