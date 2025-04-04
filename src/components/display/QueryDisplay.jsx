import { Chip } from "@mui/material";

export default function QueryDisplay ({queryTree}) {

    if(!queryTree || !queryTree.hash) {
        return <div className="mt-3">Type your query to start...</div>
    }

    return (
        <div className="query-container mt-2 pb-2 overflow-hidden border-1 border-gray-600 rounded-l">
            <header className="w-full p-2 text-white bg-gray-600 flex items-center gap-4">
                <div>{queryTree.name}</div>
                <div id="fields-container">
                    {queryTree.fields.map((field, i) => (
                        <Chip key={i} label={field} className="mr-1" color="primary"></Chip>
                    ))}
                </div>
            </header>

            <main>
                <div className="p-2">
                    {queryTree.children?.length > 0 && (
                        queryTree.children.map(child => 
                            <QueryDisplay queryTree={child} key={child.hash} />
                        )
                    )}
                </div>
                <pre className="p-2">{queryTree.code}</pre>
            </main>    
    
        </div>
    )
}