/* eslint-disable @typescript-eslint/no-explicit-any */

export class TestRegistry
{
    private static _nodes: Record<string, any> = {}
    
    public static register(namespace: string, nodes: Record<string, any>): void
    {
        for (const key of Object.keys(nodes)) 
        {
            TestRegistry._nodes[`${namespace}.${key}`] = nodes[key];
        }

        (window as any).__testNodes = TestRegistry._nodes;
    }

    public static unregister(namespace: string): void 
    {
        const prefix = `${namespace}.`;
        for (const key of Object.keys(TestRegistry._nodes)) 
        {
            if (key.startsWith(prefix)) 
            {
                delete TestRegistry._nodes[key];
            }
        }

        (window as any).__testNodes = TestRegistry._nodes;
    }
}
