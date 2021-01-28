export enum StrictNucleotideType {
    C = 0, // cytosine
    G = 1, // guanine
    A = 2, // adenine
    T = 3, // thymine
}

export type NucleotideType = StrictNucleotideType | undefined;

class Nucleotide {
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

export default Nucleotide;