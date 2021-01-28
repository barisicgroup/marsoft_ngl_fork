export enum StrictAminoacidType {
    // Info taken from https://upload.wikimedia.org/wikipedia/commons/a/a9/Amino_Acids.svg
    // 21 amino acids

    // Amino acids with electrically charged side chains
    // Positive
    Arginine = 0,
    Histidine = 1,
    Lysine = 2,
    //Negative
    Aspartic_Acid = 3,
    Glutamic_Acid = 4,

    // Amino acids with polar uncharged side chains
    Serine = 5,
    Threonine = 6,
    Asparagine = 7,
    Glutamine = 8,

    // Special cases
    Cysteine = 9,
    Selenocysteine = 10, // TODO not listed on the PDB 101 guide??? https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/primary-sequences-and-the-pdb-format
    Glycine = 11,
    Proline = 12,

    // Amino acids with hydrophobic side chain
    Alanine = 13,
    Valine = 14,
    Isoleucine = 15,
    Leucine = 16,
    Methionine = 17,
    Phenylalanine = 18,
    Tyrosine = 19,
    Tryptophan = 20
}

export type AminoacidType = StrictAminoacidType | undefined;

class Aminoacid {

    private _type: AminoacidType;

    constructor(t: AminoacidType | string) {
        if (typeof t === "string") {
            t = t.toLowerCase();
            switch (t) {
                case "arginine":
                case "arg":
                case "r":
                    t = StrictAminoacidType.Arginine; // 0
                    break;
                case "histidine":
                case "his":
                case "h":
                    t = StrictAminoacidType.Histidine; // 1
                    break;
                case "lysine":
                case "lys":
                case "k":
                    t = StrictAminoacidType.Lysine; // 2
                    break;
                case "aspartic acid":
                case "asp":
                case "d":
                    t = StrictAminoacidType.Aspartic_Acid; // 3
                    break;
                case "glutamic acid":
                case "glu":
                case "e":
                    t = StrictAminoacidType.Glutamic_Acid; // 4
                    break;
                case "serine":
                case "ser":
                case "s":
                    t = StrictAminoacidType.Serine; // 5
                    break;
                case "threonine":
                case "thr":
                case "t":
                    t = StrictAminoacidType.Threonine; // 6
                    break;
                case "asparagine":
                case "asn":
                case "n":
                    t = StrictAminoacidType.Asparagine; // 7
                    break;
                case "glutamine":
                case "gln":
                case "q":
                    t = StrictAminoacidType.Glutamine; // 8
                    break;
                case "cysteine":
                case "cys":
                case "c":
                    t = StrictAminoacidType.Cysteine; // 9
                    break;
                case "selenocysteine": // TODO not listed on the PDB 101 guide??? https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/primary-sequences-and-the-pdb-format
                case "sec":
                case "u":
                    t = StrictAminoacidType.Selenocysteine; // 10
                    break;
                case "glycine":
                case "gly":
                case "g":
                    t = StrictAminoacidType.Glycine; // 11
                    break;
                case "proline":
                case "pro":
                case "p":
                    t = StrictAminoacidType.Proline; // 12
                    break;
                case "alanine":
                case "ala":
                case "a":
                    t = StrictAminoacidType.Alanine; // 13
                    break;
                case "valine":
                case "val":
                case "v":
                    t = StrictAminoacidType.Valine; // 14
                    break;
                case "isoleucine":
                case "ile":
                case "i":
                    t = StrictAminoacidType.Isoleucine; // 15
                    break;
                case "leucine":
                case "leu":
                case "l":
                    t = StrictAminoacidType.Leucine; // 16
                    break;
                case "methionine":
                case "met":
                case "m":
                    t = StrictAminoacidType.Methionine; // 17
                    break;
                case "phenylalanine":
                case "phe":
                case "f":
                    t = StrictAminoacidType.Phenylalanine; // 18
                    break;
                case "tyrosine":
                case "tyr":
                case "y":
                    t = StrictAminoacidType.Tyrosine; // 19
                    break;
                case "tryptophan":
                case "trp":
                case "w":
                    t = StrictAminoacidType.Tryptophan; // 20
                    break;
                default:
                    console.error("Given amino acid type " + t + " was not recognized. Setting type to undefined");
                    t = undefined;
                    break;
            }
        }
        this._type = t;
    }

    get type(): AminoacidType {
        return this._type;
    }
}

export default Aminoacid;