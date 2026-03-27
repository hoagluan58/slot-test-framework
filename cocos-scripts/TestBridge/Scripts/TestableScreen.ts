
import { _decorator, CCString, Component } from 'cc';
import { NodeEntry } from './NodeEntry';
import { TestRegistry } from './TestRegistry';
const { ccclass, property } = _decorator;

@ccclass('TestableScreen')
export abstract class TestableScreen extends Component 
{
    @property(CCString)
    public namespace: string;

    @property([NodeEntry])
    public testNodes: NodeEntry[] = [];

    protected onLoad(): void 
    {
        TestRegistry.register(this.namespace, NodeEntry.toRecord(this.testNodes));
    }

    protected onDestroy(): void 
    {
        TestRegistry.unregister(this.namespace);
    }
}
