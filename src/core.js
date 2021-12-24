export const writable = (initialValue, start) => {
	if (initialValue === undefined || initialValue === null)
		throw new TypeError('Initial value cant be undefined or null')
	
	const typeValue = typeof initialValue
    let listeners = []
    let stop
    
    const notify = () => listeners.forEach(fn => fn(initialValue))

	const validate = value => {
		if (typeof value !== typeValue)
			throw new TypeError('The new value should be of type [' + typeValue + ']')
	}
    
	const set = newValue => {
		validate(newValue)
        initialValue = newValue
		notify()
	}
    
	const update = fn => {
		const result = fn(initialValue)
		validate(result)
		set(result)
	}

	const onStart = () => {
		if (start && typeof start === 'function') {
			stop = start(set)
		}
	}

	const onStop = () => {
		if (stop && typeof stop === 'function') {
			stop()
			stop = null
		} else {
			if(start)
				console.warn('stop is not a function')
		}
	}

	const subscribe = fn => {
		listeners.push(fn)
        if (listeners.length === 1) {
			onStart()
		}

		fn(initialValue)
		
		return () => {
            listeners = listeners.filter(item => item !== fn)
			if (listeners.length === 0) {
				onStop()
			}
		}
	}

	
	return  {initialValue, set, update, subscribe}

}

export const readable = (initialValue, start) => {
	const result = writable(initialValue, start)

	return {
		initialValue: result.initialValue,
		subscribe: result.subscribe 
	}
}

export const derived = (initialValue, stores, fn) => {
	
	const result = readable(initialValue, set => {
		const values = stores.map(store => store.initialValue)
		
		const unsubs = stores.map((store, index) => store.subscribe(value => {
			values[index] = value
			set(fn(...values))
		}))

		return () => unsubs.forEach(unsub => unsub())
	})
	
	return {
		initialValue: result.initialValue, 
		subscribe: result.subscribe
	}
}