import { useCallback, useState } from "react";

export function usePersistedState<T>(key: string, defaultValueOrFunc: T | (() => T)): [value: T, setValue: (newValueOrFunc: (T | ((oldValue: T) => T))) => void] {
    const [value, setValue] = useState<T>(() => {
        const storageValue = localStorage.getItem(key);
        const defaultValue = defaultValueOrFunc instanceof Function ? defaultValueOrFunc() : defaultValueOrFunc;

        if (storageValue === null)
            return defaultValue;

        if (typeof defaultValue === 'string')
            return storageValue;
        if (typeof defaultValue === 'number')
            return Number(storageValue);
        if (typeof defaultValue === 'boolean')
            return Boolean(storageValue);
        return JSON.parse(storageValue);
    });

    const setPersistedValue = useCallback((newValueOrFunc: T | ((oldValue: T) => T)) => {
        setValue(oldValue => {
            const newValue = (newValueOrFunc instanceof Function) ? newValueOrFunc(oldValue) : newValueOrFunc;
            if (typeof newValue === 'string')
                localStorage.setItem(key, newValue);
            else if (typeof newValue === 'number' || typeof newValue === 'boolean')
                localStorage.setItem(key, String(newValue));
            else
                localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        })
    }, [key]);

    return [value, setPersistedValue];
}