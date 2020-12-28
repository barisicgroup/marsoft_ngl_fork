import Component, { ComponentParameters } from '../component/component';
import { Stage } from '../ngl';
import DnaOrigamiNanostructure from './DnaOrigamiNanostructure';

class CustomComponent extends Component {
    nanostructure : DnaOrigamiNanostructure;

    constructor(readonly stage: Stage, nanostructure: DnaOrigamiNanostructure, params: Partial<ComponentParameters> = {}) {
        super(stage, nanostructure, params);

        this.nanostructure = nanostructure;
    }

    get type(): string {
        return "custom";
    }

    addRepresentation(type: string, params: any) {
        return this._addRepresentation(type, this.nanostructure, params);
    }

}

export default CustomComponent;