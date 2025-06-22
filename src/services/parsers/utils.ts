import { Node } from 'web-tree-sitter';
import murmur from "murmurhash-js";

export function getDirectChildByType(node: Node | null, type: string): (Node)[] {
    if (!node) {
        return [];
    }
    
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

export function generateHash(text: string): string {
    return murmur.murmur3(text + Math.random() * 1000)
}

export function parseObjectReference(objectRefText: string): {database: string, schema: string, name: string} {
    const text = objectRefText.replaceAll('`', '');
    const parts = text.split('.');

    let database = '', schema = '', name = '';

    if (parts.length === 3) {
        [database, schema, name] = parts;
    } else if (parts.length === 2) {
        [schema, name] = parts;
    } else if (parts.length === 1) {
        [name] = parts;
    }

    return { database, schema, name };
}