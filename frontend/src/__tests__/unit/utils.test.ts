import { describe, expect, it } from 'vitest'
import { usernameOutput } from '../../utils/username';

describe('Utils tests', () => {
    describe('Username custom output', () => {
        it('should return correct value', () => {
            const short = usernameOutput({ name: 'Иван', email: 'email', id: 1 })
            const long = usernameOutput({ name: 'Иван Иванович', email: 'email', id: 1 })
            
            expect(short).toBeDefined()
            expect(long).toBeDefined()
            expect(short).toBe('И')
            expect(long).toBe('ИИ')
        })
    })
})