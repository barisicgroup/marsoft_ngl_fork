import {Vector3} from "three";

export enum StrictNucleobaseType {
    C = 0, // cytosine
    G = 1, // guanine
    A = 2, // adenine
    T = 3, // thymine
}

export type NucleobaseType = StrictNucleobaseType | undefined;

export class Nucleobase {
    private _type: NucleobaseType;

    constructor(t?: NucleobaseType) {
        this._type = t ? t : undefined;
    }

    get type() {
        return this._type;
    }

    set type(t: NucleobaseType) {
        this._type = t;
    }



    private static getComplementaryType(t: NucleobaseType): NucleobaseType {
        switch (t) {
            case StrictNucleobaseType.C: return StrictNucleobaseType.G;
            case StrictNucleobaseType.G: return StrictNucleobaseType.C;
            case StrictNucleobaseType.A: return StrictNucleobaseType.T;
            case StrictNucleobaseType.T: return StrictNucleobaseType.A;
            case undefined: return undefined;
        }
        throw "Unknown NucleobaseType " + t;
    }

    private static canPair(t1: NucleobaseType, t2: NucleobaseType): boolean {
        return this.getComplementaryType(t1) === t2;
    }



    public createComplementary(): Nucleobase {
        return new Nucleobase(Nucleobase.getComplementaryType(this.type));
    }

    public canPairWith(nb: Nucleobase): boolean {
        return Nucleobase.canPair(this.type, nb.type);
    }
}

export abstract class AbstractDnaStrand {
    public static readonly DISTANCE = 2; // in nanometers
    abstract get startPos(): Vector3;
    abstract get endPos(): Vector3;
    abstract set endPos(endPos: Vector3);
    abstract get numOfNucleobases(): number;
    abstract get lengthInNanometers(): number;
}

class DnaStrand extends AbstractDnaStrand {
    private _nucleobases: Array<Nucleobase>;
    private _startPos: Vector3;
    private _direction: Vector3;

    constructor(nbs: Array<Nucleobase> | number,
                startPos: Vector3 = new Vector3(0, 0, 0),
                direction: Vector3 = new Vector3(0, 1, 0)) {
        super();
        if (nbs instanceof Array) {
            this._nucleobases = nbs;
        } else {
            this._nucleobases = new Array<Nucleobase>(nbs);
            for (let i = 0; i < nbs; ++i) {
                this._nucleobases[i] = new Nucleobase();
            }
        }
        this._startPos = startPos;
        this._direction = direction;
    }

    get nucleobases(): Array<Nucleobase> {
        return this._nucleobases;
    }

    get startPos(): Vector3 {
        return this._startPos;
    }

    get endPos(): Vector3 {
        return this.startPos.clone().add(this.direction.multiplyScalar(this.lengthInNanometers));
    }

    get direction(): Vector3 {
        return this._direction;
    }

    get lengthInNanometers(): number {
        return this._nucleobases.length * DnaStrand.DISTANCE;
    }

    get numOfNucleobases(): number {
        return this._nucleobases.length;
    }

    public createComplementary(): DnaStrand {
        const n: number = this.nucleobases.length;
        let nbs: Array<Nucleobase> = new Array<Nucleobase>(n);
        for (let i = 0; i < n; ++i) {
            nbs[i] = this.nucleobases[i].createComplementary();
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
        return this._startPos;
    }

    get endPos(): Vector3 {
        return this._endPos;
    }

    set endPos(endPos: Vector3) {
        this._endPos = endPos;
    }

    get numOfNucleobases(): number {
        let distance: number = this.startPos.distanceTo(this.endPos);
        let numOfNucleobases: number = Math.floor(distance / DnaStrand.DISTANCE);
        return numOfNucleobases;
    }

    get lengthInNanometers(): number {
        return this.numOfNucleobases * DnaStrand.DISTANCE;
    }

    public toDNAStrand(): DnaStrand {
        let direction: Vector3 = this.endPos.clone().sub(this.startPos).normalize();
        return new DnaStrand(this.numOfNucleobases, this.startPos, direction);
    }
}

export default DnaStrand;
