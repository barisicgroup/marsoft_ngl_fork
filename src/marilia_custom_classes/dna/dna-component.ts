import Component, {ComponentParameters} from "../../component/component";
import Stage from "../../stage/stage";
import DnaStrand, {DummyDnaStrand} from "./dna-strand";


export class DnaStrandComponent extends Component {

    private dnaStrand: DnaStrand | DummyDnaStrand;

    constructor(readonly stage: Stage, dnaStrand: DnaStrand | DummyDnaStrand, params: Partial<ComponentParameters> = {}) {
        super(stage, dnaStrand, params);

        this.dnaStrand = dnaStrand;
    }

    get type(): string {
        return "custom";
    }

    addRepresentation(type: any, params: any): any {
        return this._addRepresentation(type, this.dnaStrand, params);
    }

    updateRepresentations(what: any) {
        super.updateRepresentations(what);
    }
}