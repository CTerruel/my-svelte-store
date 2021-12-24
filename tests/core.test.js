import { writable, readable, derived } from "../src/core"

describe('writable', () => {
    
    it('if the initial value of writable store is undefined or null should throw TypeError', () => {
        const tError = () => {
            const store = writable()
        }

        expect(tError).toThrow(TypeError)
    })

    it('create a new writable store', () => {
        const store = writable(0)
        const keys = ['initialValue', 'set', 'subscribe', 'update']
        const storeKeys = Object.keys(store)

        expect(storeKeys.sort()).toEqual(keys.sort())

    })

    it('testing the update function of store', () => {
        let value = 0
        const store = writable(0)
        store.subscribe(v => value = v)
        store.update(v => ++v)
        store.update(v => ++v)

        expect(value).toBe(2)
    })

    it('testing the set function of store', () => {
        let value = 0
        const store = writable(0)
        store.subscribe(v => value = v)
        store.set(2)

        expect(value).toBe(2)
    })

    it('testing the start and stop function of store', () => {
        let value1 = 0, value2 = 0, called = 0
        const store = writable(0, () => {
            called += 1
            return () => called -= 1
        })
        const unsub1 = store.subscribe(v => value1 = v)
        const unsub2 = store.subscribe(v => value2 = v)
        store.update(v => ++v)
        store.update(v => ++v)

        expect(value1).toBe(2)
        expect(value2).toBe(2)
        expect(called).toBe(1)
        
        unsub1()
        unsub2()
        
        expect(called).toBe(0)
    })

    it('testing the set function of start function of store', () => {
        let value = 0
        const store = writable(0, set => {
            set(2)
        })
        store.subscribe(v => value = v)

        expect(value).toBe(2)
    })

    it('testing unsubscriber function', () => {
        let value1 = 0, value2 = 0

        const counter1 = writable(0)
        const counter2 = derived(0, [counter1], $counter1 => $counter1 * 2)
        
        const unsub1 = counter1.subscribe(v => value1 = v)
        const unsub2 = counter2.subscribe(v => value2 = v)

        counter1.update(v => ++v) // value1 = 1, value2 = 2
        unsub1()
        counter1.update(v => ++v) // value1 = 1, value2 = 4
        unsub2()
        counter1.update(v => ++v) // value1 = 1, value2 = 4

        expect(value1).toBe(1)
        expect(value2).toBe(4)
    })

    it ('if the [typeof new value] is diferent of [typeof initial value] should throw TypeError', () => {
        let value = 0
        const store = writable(0)
        const typeValue = typeof store.initialValue
        store.subscribe(v => value = v)
        
        const tErrorUpdate = () => store.update(v => v + 'oi')
        const tErrorSet = () => store.set('oi')

        expect(tErrorUpdate).toThrow(TypeError)
        expect(tErrorUpdate).toThrow('The new value should be of type [' + typeValue + ']')
        
        expect(tErrorSet).toThrow(TypeError)
        expect(tErrorSet).toThrow('The new value should be of type [' + typeValue + ']')

        expect(value).toBe(0)
    })

    it('should show console.warn [msg = stop is not a function] when the stop function is not provided', () => {
        let value = 0
        const counter = writable(0, () => {})
        const unsub = counter.subscribe(v => value = v)

        const consoleSpy = jest.spyOn(console, 'warn')

        counter.update(v => ++v)
        unsub()
        counter.update(v => ++v)

        expect(consoleSpy).toHaveBeenCalledWith('stop is not a function')
        expect(value).toBe(1)
    })
})

describe('readable', () => {
    
    it('create a new readable store', () => {
        const store = readable(0)
        const keys = ['initialValue', 'subscribe']
        const storeKeys = Object.keys(store)

        expect(storeKeys.sort()).toEqual(keys.sort())

    })

    it('create a new readable store with start function', () => {
        let value = 0
        const store = readable(0, set => {
            set(2)
            return () => {}
        })
        store.subscribe(v => value = v)

        expect(value).toBe(2)
    })
})

describe('derived', () => {

    it('create a new derived store', () => {
        let value = 0
        const store = writable(0)
        const doubleStore = derived(0, [store], $store => $store * 2)
        doubleStore.subscribe(v => value = v)
        store.update(v => ++v)
        store.update(v => ++v)

        expect(value).toBe(4)
    })

    it('create a new derived store with multiples stores', () => {
        let value = 0
        const store1 = writable(0)
        const store2 = writable(0)
        const multiply = derived(0, [store1, store2], ($store1, $store2) => $store1 * $store2)
        multiply.subscribe(v => value = v)
        store1.set(2)
        store2.set(2)

        expect(value).toBe(4)
    })

    it('create a new derived store with multiples stores of different types', () => {
        let value = ''
        const store1 = writable(1)
        const store2 = writable('um')
        const multiply = derived('', [store1, store2], ($store1, $store2) => `${$store2} ${$store1}`)
        multiply.subscribe(v => value = v)

        expect(value).toBe('um 1')
    })
})