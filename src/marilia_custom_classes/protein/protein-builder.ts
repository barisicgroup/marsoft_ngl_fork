import Structure from "../../structure/structure";
import Protein from "./protein";

class ProteinBuilder {
    public buildFromStructure(s: Structure): Protein {
        // TODO
        let p: Protein = new Protein();
        return p;
    }
}

export default ProteinBuilder;