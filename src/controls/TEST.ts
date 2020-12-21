/**
 *
 */

import Stage from "../stage/stage";
import PickingProxy from "./picking-proxy";
import StructureComponent from "../component/structure-component";
import Structure from "../structure/structure";
import AtomStore from "../store/atom-store";
import BondStore from "../store/bond-store";
import RepresentationElement from "../component/representation-element";
import CartoonRepresentation from "../representation/cartoon-representation";
import BallAndStickRepresentation from "../representation/ballandstick-representation";
import Representation from "../representation/representation";

class TestModification {
    // Initialize member variables

    constructor(/* Maybe have some input*/) {
        // Maybe do some stuff...
    }

    hover(stage: Stage, pickingProxy: PickingProxy) {
        if (pickingProxy) {
            //console.log("Hovered over some structure!");
        }
    }

    clickPick_left(stage: Stage, pickingProxy: PickingProxy) {
        if (pickingProxy) {
            let text: string = "You've picked";
            if (pickingProxy.atom) {
                text += " an atom"
            } else if (pickingProxy.bond) {
                text += " a bond"
            } else {
                text += "... something";
            }
            text += "! Here's its component and also the stage:";
            console.log(text);
            console.log(pickingProxy.component);
            console.log(stage);

            if (pickingProxy.component instanceof StructureComponent) {
                let component: StructureComponent = pickingProxy.component;
                let structure: Structure = component.object;
                let atomStore: AtomStore = structure.atomStore; // Atom data is stored here!
                let bondStore: BondStore = structure.bondStore; // Bond data is stored here!

                console.log("And now the AtomStore and BondStore:");
                console.log(atomStore);
                console.log(bondStore);

                console.assert(stage === component.stage);
                console.assert(stage.viewer === component.viewer);

                console.log("And now some representations of this component")
                component.reprList.forEach((value: RepresentationElement) => {
                    let reprName: string = value.parameters.name;
                    let repr: Representation = value.repr;
                    if (reprName === 'cartoon') {
                        console.assert(repr instanceof CartoonRepresentation);
                        console.log(repr);
                    } else if (reprName === 'ball+stick') {
                        console.assert(repr instanceof BallAndStickRepresentation);
                        console.log(repr);
                    }
                });
            }
        }
    }

}

export default TestModification;