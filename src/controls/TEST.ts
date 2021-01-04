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
//import {StoreField} from "../store/store";
import {Matrix4, Vector3} from "three";
//import {AtomDataFields, BondDataFields} from "../structure/structure-data";
//import StructureBuilder from "../structure/structure-builder";

class TestModification {
    // Initialize member variables

    constructor(/* Maybe have some input*/) {

    }

    public hover(stage: Stage, pickingProxy: PickingProxy) {
        if (pickingProxy) {
            //console.log("Hovered over some structure!");
        }
    }

    public clickPick_left(stage: Stage, pickingProxy: PickingProxy) {
        if (pickingProxy && pickingProxy.atom) {
            let text: string = "You've picked an atom!";
            text += " Here's its component and also the stage:";
            console.log(text);
            console.log(pickingProxy.component);
            console.log(stage);

            if (pickingProxy.component instanceof StructureComponent) {
                let component: StructureComponent = pickingProxy.component;
                let structure: Structure = component.object;
                //let atomStore: AtomStore = structure.atomStore; // Atom data is stored here!
                //let bondStore: BondStore = structure.bondStore; // Bond data is stored here!

                //console.log("And now the AtomStore and BondStore:");
                //console.log(atomStore);
                //console.log(bondStore);

                console.assert(stage === component.stage);
                console.assert(stage.viewer === component.viewer);

                //let sb: StructureBuilder = new StructureBuilder(structure);
                //sb.addAtom(0, '', '', '', 0, false);

                let id: number = structure.atomMap.add('Steve', 'Johnson');
                console.log("ID of newly added atom/element pair: " + id);

                TestModification.addSomething(stage, component, pickingProxy.atom.index, id);

                /*structure.atomStore._fields.forEach((field: StoreField) => {
                    let fieldName: string = field[0];
                    console.log(fieldName);
                    console.log(structure.atomStore[fieldName]);
                }) ;*/

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

                        let basRepr: BallAndStickRepresentation = <BallAndStickRepresentation> repr;

                        //const what: BondDataFields | AtomDataFields = { color: true };
                        //basRepr.update(what);
                        //basRepr.create();
                        basRepr.build();
                    }

                    // Update everything (TODO: ...for now)
                    //repr.update({position: true, color: true, radius: true, picking: true, index: true});
                });
            }
        } else if (pickingProxy) {
            if (pickingProxy.bond) {
                console.log("You've picked a bond!");
            } else {
                console.log("You've picked... something!");
            }
        } else {
            console.log("click!");
        }
    }

    private static addSomething(stage: Stage, component: StructureComponent, atomIndex: number, atomTypeId: number) {
        let structure = component.structure;

        let atomStore: AtomStore = structure.atomStore;
        let bondStore: BondStore = structure.bondStore;

        let pos: Vector3 = stage.mouseObserver.getWorldPosition();
        console.log(pos);

        let x: number = atomStore.x[atomIndex];
        let y: number = atomStore.y[atomIndex];
        let z: number = atomStore.z[atomIndex];
        //let offset = new Vector3(x, y, z);

        //let componentTransformation: Matrix4 = component.matrix;
        //let camPos: Vector3 = stage.viewer.camera.position;
        let camMat: Matrix4 = stage.viewer.camera.matrix;
        console.log("Camera matrix:")
        console.log(camMat);

        let atomCount: number = atomStore.count;
        let bondCount: number = bondStore.count;
        {
            atomStore.growIfFull();
            atomStore.x[atomCount] = x;
            atomStore.y[atomCount] = y;
            atomStore.z[atomCount] = z + 10;
            atomStore.altloc[atomCount] = 0;
            atomStore.atomTypeId[atomCount] = atomTypeId;
            atomStore.bfactor[atomCount] = Math.random() * 40;
            if (atomStore.formalCharge) atomStore.formalCharge[atomCount] = 0;
            if (atomStore.partialCharge) atomStore.partialCharge[atomCount] = 0;
            atomStore.residueIndex[atomCount] = atomStore.residueIndex[atomIndex] + 1;
            atomStore.serial[atomCount] = atomCount + 1;
            atomStore.occupancy[atomCount] = 1;

            bondStore.growIfFull();
            bondStore.atomIndex1[bondCount] = atomIndex;
            bondStore.atomIndex2[bondCount] = atomCount;
            bondStore.bondOrder[bondCount] = 1;
        }
        ++atomStore.count;
        ++bondStore.count;

        console.log("AtomStore and BondStore")
        console.log(atomStore);
        console.log(bondStore);
    }

}

export default TestModification;