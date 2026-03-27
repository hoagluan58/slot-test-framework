import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeEntry')
export class NodeEntry
{
    @property({ displayName: 'Key' })
    public key: string = '';

    @property({ type: Node, displayName: 'Node' })
    public node: Node = null;

    public static toRecord(entries: NodeEntry[]): Record<string, Node>
    {
        const record: Record<string, Node> = {};
        for (const entry of entries)
        {
            if (entry.key)
            {
                record[entry.key] = entry.node;
            }
        }
        return record;
    }
}
