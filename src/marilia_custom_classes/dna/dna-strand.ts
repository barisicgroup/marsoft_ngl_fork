import {Vector3} from "three";

export enum StrictNucleotideType {
    C = 0, // cytosine
    G = 1, // guanine
    A = 2, // adenine
    T = 3, // thymine
}

export type NucleotideType = StrictNucleotideType | undefined;

export class Nucleotide {
    private _type: NucleotideType;

    constructor(t?: NucleotideType) {
        this._type = t ? t : undefined;
    }

    get type() {
        return this._type;
    }

    set type(t: NucleotideType) {
        this._type = t;
    }



    private static getComplementaryType(t: NucleotideType): NucleotideType {
        switch (t) {
            case StrictNucleotideType.C: return StrictNucleotideType.G;
            case StrictNucleotideType.G: return StrictNucleotideType.C;
            case StrictNucleotideType.A: return StrictNucleotideType.T;
            case StrictNucleotideType.T: return StrictNucleotideType.A;
            case undefined: return undefined;
        }
        throw "Unknown NucleotideType " + t;
    }

    private static canPair(t1: NucleotideType, t2: NucleotideType): boolean {
        return this.getComplementaryType(t1) === t2;
    }



    public createComplementary(): Nucleotide {
        return new Nucleotide(Nucleotide.getComplementaryType(this.type));
    }

    public canPairWith(nb: Nucleotide): boolean {
        return Nucleotide.canPair(this.type, nb.type);
    }
}

export abstract class AbstractDnaStrand {
    public static readonly HELIX_PITCH = 34; // According to Wikipedia: https://en.wikipedia.org/wiki/DNA
    //public static readonly HELIX_LEAD = AbstractDnaStrand.HELIX_PITCH * 2;
    public static readonly HELIX_RADIUS = 10; // According to Wikipedia: https://en.wikipedia.org/wiki/DNA
    public static readonly NUCLEOTIDES_PER_TURN = 10.5; // According to Wikipedia: TODO link
    public static readonly HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES = AbstractDnaStrand.HELIX_PITCH / AbstractDnaStrand.NUCLEOTIDES_PER_TURN;

    /**
     * All Vector3s returned must never be a reference to a member! When implementing, use clone() to return a copy
     */

    abstract get startPos(): Vector3;
    abstract get endPos(): Vector3;
    abstract set endPos(endPos: Vector3);
    abstract get direction(): Vector3; // Returns a normalized vector
    abstract get numOfNucleotides(): number;
    abstract get lengthInNanometers(): number;
}

class DnaStrand extends AbstractDnaStrand {
    private _nucleotides: Array<Nucleotide>;
    private _startPos: Vector3;
    private _direction: Vector3;

    constructor(nbs: Array<Nucleotide> | number,
                startPos: Vector3 = new Vector3(0, 0, 0),
                direction: Vector3 = new Vector3(0, 1, 0)) {
        super();
        if (nbs instanceof Array) {
            this._nucleotides = nbs;
        } else {
            this._nucleotides = new Array<Nucleotide>(nbs);
            for (let i = 0; i < nbs; ++i) {
                this._nucleotides[i] = new Nucleotide();
            }
        }
        this._startPos = startPos;
        this._direction = direction;
    }

    get nucleotides(): Array<Nucleotide> {
        return this._nucleotides;
    }

    get startPos(): Vector3 {
        return this._startPos.clone();
    }

    get endPos(): Vector3 {
        return this._startPos.clone().add(this.direction.multiplyScalar(this.lengthInNanometers));
    }

    get direction(): Vector3 {
        return this._direction.clone();
    }

    get lengthInNanometers(): number {
        return this._nucleotides.length * DnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES;
    }

    get numOfNucleotides(): number {
        return this._nucleotides.length;
    }

    public createComplementary(): DnaStrand {
        const n: number = this.nucleotides.length;
        let nbs: Array<Nucleotide> = new Array<Nucleotide>(n);
        for (let i = 0; i < n; ++i) {
            nbs[i] = this.nucleotides[i].createComplementary();
        }
        return new DnaStrand(nbs);
    }
}

export class DummyDnaStrand extends AbstractDnaStrand {
    private _startPos: Vector3;
    private _endPos: Vector3;

    constructor(startPos: Vector3 = new Vector3(0, 0, 0),
                endPos: Vector3 = new Vector3(0, 0, 0)) {
        super();
        this._startPos = startPos;
        this._endPos = endPos;
    }

    get startPos(): Vector3 {
        return this._startPos.clone();
    }

    get endPos(): Vector3 {
        return this._startPos.clone().add(this.direction.multiplyScalar(this.lengthInNanometers));
    }

    set endPos(endPos: Vector3) {
        this._endPos.copy(endPos);
    }

    get direction(): Vector3 {
        return this._endPos.clone().sub(this._startPos).normalize();
    }

    get numOfNucleotides(): number {
        let distance: number = this._startPos.distanceTo(this._endPos);
        let numOfNucleotides: number = Math.floor(distance / DummyDnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES);
        return numOfNucleotides;
    }

    get lengthInNanometers(): number {
        return this.numOfNucleotides * DummyDnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES;
    }

    public toDNAStrand(): DnaStrand {
        return new DnaStrand(this.numOfNucleotides, this.startPos, this.direction);
    }
}

export default DnaStrand;
