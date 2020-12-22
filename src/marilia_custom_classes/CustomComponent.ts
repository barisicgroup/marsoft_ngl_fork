import Component, { ComponentParameters } from '../component/component';
import { Stage } from '../ngl';

class CustomComponent extends Component {
    constructor(readonly stage: Stage, readonly object: any, params: Partial<ComponentParameters> = {}) {
        super(stage, object, params);
    }

    get type(): string {
        return "custom";
    }

    addRepresentation(type: string, object: any) {
        return this._addRepresentation(type, object, null);
    }

}

export default CustomComponent;