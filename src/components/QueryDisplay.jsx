

export default function QueryDisplay ({queryTree}) {

    if(!queryTree || !queryTree.hash) {
        <div>Type your query to start...</div>
    }

    return (
        <div className="query-container mt-2 pb-2 border-1 rounded">
            <header class="w-full bg-indigo-600 p-2 text-white">
                <div>{queryTree.name}</div>
            </header>

            <div class="p-2">
            {queryTree.children?.length > 0 && (
                queryTree.children.map(child => 
                    <QueryDisplay queryTree={child} />
                )
            )}
            </div>

            <pre class="p-2">{queryTree.code}</pre>
        </div>
    )
}