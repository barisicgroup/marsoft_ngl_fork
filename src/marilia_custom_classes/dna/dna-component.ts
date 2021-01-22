import Component, {ComponentParameters} from "../../component/component";
import Stage from "../../stage/stage";
//import DNAStrand, {DummyDNAStrand} from "./dna-strand";


export class DNAStrandComponent extends Component {

    private dnaStrand: any;//DNAStrand | DummyDNAStrand;

    constructor(readonly stage: Stage, dnaStrand: any, params: Partial<ComponentParameters> = {}) {
        super(stage, dnaStrand, params);

        this.dnaStrand = dnaStrand;
    }

    get type(): string {
        return "custom";
    }

    addRepresentation(type: any, params: any): any {
        return this._addRepresentation(type, this.dnaStrand, params);
    }


}