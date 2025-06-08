import React from 'react';

interface Props {
    data: {
        code: string;
    };
}

export default function WhereNode({ data }: Props) {
    return (
        <div className="rounded-t-xs overflow-visible border-1 bg-yellow-100 border-yellow-400">
            <header className='py-1 px-2 bg-yellow-400 flex items-center justify-between'>
                <span className='text-lg text-black'>WHERE</span>
            </header>
            <section className='text-xs bg-yellow-50 p-2 font-mono'>
                {data.code}
            </section>
        </div>
    );
} 