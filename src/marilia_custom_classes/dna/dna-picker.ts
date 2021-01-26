import {Picker} from "../../utils/picker";
import DnaStrand, {Nucleotide} from "./dna-strand";
import {Vector3} from "three";

export class NucleotideProxy {
    private _dna: DnaStrand;
    private _index: number;
    constructor(dna: DnaStrand, pid: number) {
        this._dna = dna;
        this._index = pid;
    }

    get nucleotide(): Nucleotide {
        return this._dna.nucleotides[this.index];
    }

    get dnaStrand(): DnaStrand {
        return this._dna
    }

    get index(): number {
        return this._index;
    }

    get position(): Vector3 {
        let pos: Vector3 = this._dna.startPos.clone();
        let dir: Vector3 = this._dna.direction.clone();
        pos.add(dir.multiplyScalar(this.index));
        return pos;
    }
}

class NucleotidePicker extends Picker {
    private dna: DnaStrand;
    constructor(array: Uint32Array, dna: DnaStrand) {
        super(array);
        this.dna = dna;
    }

    get type(): string {
        return "nucleotide";
    }

    get data(): DnaStrand {
        return this.dna;
    }

    getObject(pid: number): NucleotideProxy {
        return new NucleotideProxy(this.dna, this.getIndex(pid));
    }

    _getPosition(pid: number): Vector3 {
        return this.getObject(this.getIndex(pid)).position;
    }
}

export default NucleotidePicker;