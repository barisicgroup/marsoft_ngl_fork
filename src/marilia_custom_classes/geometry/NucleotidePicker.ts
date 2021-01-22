import { Vector3 } from "three";
import { Picker } from "../../utils/picker"

export class TestPickingStructure {
    nucleotides: TestPickingNucleotide[];

    constructor(nucleotides: TestPickingNucleotide[]) {
        this.nucleotides = nucleotides;
    }

    getNucleotideById(id: number): TestPickingNucleotideProxy {
        return new TestPickingNucleotideProxy(this.nucleotides[id], id);
    }
}

export class TestPickingNucleotide {
    readonly nbType: 'A' | 'T' | 'C' | 'G';
    readonly pos: Vector3;

    constructor(nbType: 'A' | 'T' | 'C' | 'G', pos: Vector3) {
        this.nbType = nbType;
        this.pos = pos;
    }
}

export class TestPickingNucleotideProxy {
    readonly nbType: 'A' | 'T' | 'C' | 'G';
    readonly pos: Vector3;
    readonly id: number;

    constructor(nucl: TestPickingNucleotide, id: number) {
        this.nbType = nucl.nbType;
        this.pos = nucl.pos;
        this.id = id;
    }
}

class NucleotidePicker extends Picker {
    structure: TestPickingStructure;

    constructor(idsArray : number[], structure: TestPickingStructure) {
        super(idsArray);
        this.structure = structure;
    }

    get type() {
        return "nucleotide";
    }

    get data() {
        return this.structure;
    }

    getObject(pid: number): TestPickingNucleotideProxy {
        return this.structure.getNucleotideById(pid);
    }

    _getPosition(pid: number) {
        return this.getObject(pid).pos.clone();
    }
}

export default NucleotidePicker;