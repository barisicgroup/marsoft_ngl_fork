import {Vector3} from "three";

export enum NucleobaseType {
    C, // cytosine
    G, // guanine
    A, // adenine
    T, // thymine
}

export class Nucleobase {
    private type: NucleobaseType;
    constructor(t: NucleobaseType) {
        this.type = t;
    }



    private static getComplementaryType(t: NucleobaseType): NucleobaseType {
        switch (t) {
            case NucleobaseType.C: return NucleobaseType.G;
            case NucleobaseType.G: return NucleobaseType.C;
            case NucleobaseType.A: return NucleobaseType.T;
            case NucleobaseType.T: return NucleobaseType.A;
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

export class DNAStrand {
    public static readonly DISTANCE = 2; // in nanometers

    private _nucleobases: Array<Nucleobase>;
    private _startPos: Vector3;
    private _direction: Vector3;
    constructor(nbs: Array<Nucleobase> | undefined,
                startPos: Vector3 = new Vector3(0, 0, 0),
                direction: Vector3 = new Vector3(0, 1, 0)) {
        this._nucleobases = nbs ? nbs : [];
        this._startPos = startPos;
        this._direction = direction;
    }

    get nucleobases(): ReadonlyArray<Nucleobase> {
        return this._nucleobases;
    }

    get startPos(): Vector3 {
        return this._startPos;
    }

    get direction(): Vector3 {
        return this._direction;
    }

    get lengthInNanometers(): number {
        return this._nucleobases.length * DNAStrand.DISTANCE;
    }

    public createComplementary(): DNAStrand {
        const n: number = this.nucleobases.length;
        let nbs: Array<Nucleobase> = new Array<Nucleobase>(n);
        for (let i = 0; i < n; ++i) {
            nbs[i] = this.nucleobases[i].createComplementary();
        }
        return new DNAStrand(nbs);
    }
}