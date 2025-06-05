import { Node } from 'web-tree-sitter';

export function getDirectChildByType(node: Node, type: string): (Node)[] {
    return node.namedChildren.filter((child: Node) => child !== null && child?.type === type);
}

// Return all nodes of a given type without entering subqueries
export function getNodeTypesInCurrentScope(node: Node, type: string): Node[] {
    const hits: Node[] = [];
    const children = node.namedChildren;
    const heap = [...children];
    while(heap.length > 0) {
        const currentNode = heap.pop();
        if(currentNode?.type === type) {
            hits.push(currentNode);
        }
        
        if(currentNode?.type !== 'subquery' && currentNode?.type !== 'cte') {
            heap.push(...currentNode?.namedChildren ?? []);
        }
    }

    return hits;
}

export function findAllSubqueries(node: Node): Node[] {
    return getNodeTypesInCurrentScope(node, 'subquery');
}