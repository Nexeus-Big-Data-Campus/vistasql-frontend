import { useState, useEffect } from 'react';
import { loadTreeSitterParser } from '../services/parsers/queryParser';

export function useTreeSitterLoader() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTreeSitterParser().then(() => {
            setIsLoaded(true);
        });
    }, []);

    return isLoaded;
}