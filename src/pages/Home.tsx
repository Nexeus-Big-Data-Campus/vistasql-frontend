import { Link } from "react-router";
import React from 'react';
import Button from '@mui/material/Button';

export default function Home() {
    return (
        <>
            <section className="flex flex-col items-center justify-center h-1/4 pt-4"> 
                <Link to="/editor" className="bg-blue-500 rounded text-white px-4 py-2">
                    Ir a Editor
                </Link>
            </section>
            
        </>
        
    );
}