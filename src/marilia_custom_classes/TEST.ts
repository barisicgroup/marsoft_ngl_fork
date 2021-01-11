/**
 *
 */

import Stage from "../stage/stage";
import PickingProxy from "../controls/picking-proxy";
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
import AtomProxy from "../proxy/atom-proxy";
import StructureView from "../structure/structure-view";
//import {AtomDataFields, BondDataFields} from "../structure/structure-data";
//import StructureBuilder from "../structure/structure-builder";

export enum TestModificationMode {
    NONE,
    BOND_FROM_ATOM,
    BOND_BETWEEN_ATOMS,
    REMOVE
}

export class TestModification {
    // Initialize member variables

    constructor(/* Maybe have some input*/) {

    }

    private _mode: TestModificationMode = TestModificationMode.NONE;
    get mode(): TestModificationMode {
        return this._mode;
    }
    set mode(mode: TestModificationMode) {
        this._mode = mode;
    }
    public setModeToBondFromAtom() {
        this.mode = TestModificationMode.BOND_FROM_ATOM;
    }
    public setModeToBondBetweenAtoms() {
        this.mode = TestModificationMode.BOND_BETWEEN_ATOMS;
    }
    public setModeToRemove() {
        this.mode = TestModificationMode.REMOVE;
    }

    public hover(stage: Stage, pickingProxy: PickingProxy) {
        if (pickingProxy) {
            //console.log("Hovered over some structure!");
        }
    }

    public clickPick_left(stage: Stage, pickingProxy: PickingProxy) {
        switch (this.mode) {
            case TestModificationMode.BOND_FROM_ATOM:
                this.clickPick_left_bondFromAtom(stage, pickingProxy);
                break;
            case TestModificationMode.BOND_BETWEEN_ATOMS:
                this.clickPick_left_bondBetweenAtoms(stage, pickingProxy);
                break;
            case TestModificationMode.REMOVE:
                this.clickPick_left_remove(stage, pickingProxy);
                break;
            default:
                // Do nothing (TODO: for now...)
                break;
        }
    }

    public clickPick_left_remove(stage: Stage, pickingProxy: PickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent)) return;
        let component: StructureComponent = pickingProxy.component;

        // Hide from all representations not good. TODO detect which representation the user picked
        component.reprList.forEach( (value: RepresentationElement) => {

            //let structure: Structure = value.repr.structure.structure;
            let structureView: StructureView = value.repr.structure;

            if (pickingProxy.atom) {
                //TestModification.removeAtom(stage, structure, pickingProxy.atom.index);
                //value.repr.structure.structure.atomSet.clear(pickingProxy.atom.index);
                //structure.atomSet.clear(pickingProxy.atom.index);
                structureView.atomSet?.clear(pickingProxy.atom.index);
            } else if (pickingProxy.bond) {
                //TestModification.removeBond(stage, structure, pickingProxy.bond.index);
                //structure.bondSet.clear(pickingProxy.bond.index);
                structureView.bondSet?.clear(pickingProxy.bond.index);
            }

            value.repr.build();
        });
    }

    private lastPickedAtom: AtomProxy;
    private lastPickedAtomComponent: StructureComponent;
    private atomPicked: boolean = false;
    public clickPick_left_bondBetweenAtoms(stage: Stage, pickingProxy: PickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent)) return;
        if (pickingProxy.atom) {
            if (this.atomPicked && this.lastPickedAtomComponent === pickingProxy.component) {
                let component: StructureComponent = pickingProxy.component;
                TestModification.addBondBetweenAtoms(stage, component.structure, this.lastPickedAtom.index, pickingProxy.atom.index);
                component.reprList.forEach( (value: RepresentationElement) => {
                    //let reprName: string = value.parameters.name;
                    let repr: Representation = value.repr;
                    repr.build();
                });
                this.atomPicked = false;
            } else {
                this.lastPickedAtom = pickingProxy.atom;
                this.lastPickedAtomComponent = pickingProxy.component;
                this.atomPicked = true;
            }
        }
    }

    public clickPick_left_bondFromAtom(stage: Stage, pickingProxy: PickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent)) return;
        if (pickingProxy.atom) {
            let text: string = "You've picked an atom!";
            text += " Here's its component and also the stage:";
            console.log(text);
            console.log(pickingProxy.component);
            console.log(stage);

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

            TestModification.addSomething(stage, component.structure, pickingProxy.atom.index, id);

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

                    let basRepr: BallAndStickRepresentation = <BallAndStickRepresentation>repr;

                    //const what: BondDataFields | AtomDataFields = { color: true };
                    //basRepr.update(what);
                    //basRepr.create();
                    basRepr.build();
                }

                // Update everything (TODO: ...for now)
                //repr.update({position: true, color: true, radius: true, picking: true, index: true});
            });
        } else {
            if (pickingProxy.bond) {
                console.log("You've picked a bond!");
            } else {
                console.log("You've picked... something!");
            }
        }
    }

    /*private static removeBond(stage: Stage, structure: Structure, bondIndex: number) {
        let bondSet: BitArray | undefined = structure.bondSet;
        if (bondSet) {
            bondSet.clear(bondIndex);
        }
    }

    private static removeAtom(stage: Stage, structure: Structure, atomIndex: number) {
        structure.atomSet?.clear(atomIndex);
    }*/

    private static addBondBetweenAtoms(stage: Stage, structure: Structure, atomIndex1: number, atomIndex2: number) {
        //let atomStore: AtomStore = structure.atomStore;
        let bondStore: BondStore = structure.bondStore;

        let bondCount: number = bondStore.count;
        {
            bondStore.growIfFull();
            bondStore.atomIndex1[bondCount] = atomIndex1;
            bondStore.atomIndex2[bondCount] = atomIndex2;
            bondStore.bondOrder[bondCount] = 1;
        }
        ++bondStore.count;

        structure.finalizeBonds();
    }

    private static addSomething(stage: Stage, structure: Structure, atomIndex: number, atomTypeId: number) {
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

        structure.finalizeAtoms();
        structure.finalizeBonds();

        console.log("AtomStore and BondStore")
        console.log(atomStore);
        console.log(bondStore);
    }
}

export default TestModification;