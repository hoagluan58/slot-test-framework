import { _decorator, Component } from 'cc';
import { TestRegistry } from './TestRegistry';
const { ccclass, property } = _decorator;

@ccclass('TestableNode')
export class TestableNode extends Component 
{
    @property({tooltip: "Screen namespace"})
    public namespace: string = "";

    @property({tooltip: "Unique key within namespace"})
    public key: string = "";

    protected onLoad(): void 
    {
        if(!this.namespace || !this.key) return;        

        TestRegistry.register(this.namespace, { [this.key]: this.node });
    }

    protected onDestroy(): void 
    {
        if(!this.namespace || !this.key) return;

        TestRegistry.unregister(`${this.namespace}.${this.key}`);
    }
}
