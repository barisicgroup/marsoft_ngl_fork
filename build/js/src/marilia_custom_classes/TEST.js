/**
 *
 */
import StructureComponent from "../component/structure-component";
//import {AtomDataFields, BondDataFields} from "../structure/structure-data";
//import StructureBuilder from "../structure/structure-builder";
export var TestModificationMode;
(function (TestModificationMode) {
    TestModificationMode[TestModificationMode["NONE"] = 0] = "NONE";
    TestModificationMode[TestModificationMode["BOND_FROM_ATOM"] = 1] = "BOND_FROM_ATOM";
    TestModificationMode[TestModificationMode["BOND_BETWEEN_ATOMS"] = 2] = "BOND_BETWEEN_ATOMS";
    TestModificationMode[TestModificationMode["REMOVE"] = 3] = "REMOVE";
})(TestModificationMode || (TestModificationMode = {}));
export class TestModification {
    // Initialize member variables
    constructor( /* Maybe have some input*/) {
        this._mode = TestModificationMode.NONE;
        this.atomPicked = false;
    }
    get mode() {
        return this._mode;
    }
    set mode(mode) {
        this._mode = mode;
    }
    setModeToBondFromAtom() {
        this.mode = TestModificationMode.BOND_FROM_ATOM;
    }
    setModeToBondBetweenAtoms() {
        this.mode = TestModificationMode.BOND_BETWEEN_ATOMS;
    }
    setModeToRemove() {
        this.mode = TestModificationMode.REMOVE;
    }
    hover(stage, pickingProxy) {
        if (pickingProxy) {
            //console.log("Hovered over some structure!");
        }
    }
    clickPick_left(stage, pickingProxy) {
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
    clickPick_left_remove(stage, pickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent))
            return;
        let component = pickingProxy.component;
        // Hide from all representations not good. TODO detect which representation the user picked
        component.reprList.forEach((value) => {
            var _a, _b;
            //let structure: Structure = value.repr.structure.structure;
            let structureView = value.repr.structure;
            if (pickingProxy.atom) {
                //TestModification.removeAtom(stage, structure, pickingProxy.atom.index);
                //value.repr.structure.structure.atomSet.clear(pickingProxy.atom.index);
                //structure.atomSet.clear(pickingProxy.atom.index);
                (_a = structureView.atomSet) === null || _a === void 0 ? void 0 : _a.clear(pickingProxy.atom.index);
            }
            else if (pickingProxy.bond) {
                //TestModification.removeBond(stage, structure, pickingProxy.bond.index);
                //structure.bondSet.clear(pickingProxy.bond.index);
                (_b = structureView.bondSet) === null || _b === void 0 ? void 0 : _b.clear(pickingProxy.bond.index);
            }
            value.repr.build();
        });
    }
    clickPick_left_bondBetweenAtoms(stage, pickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent))
            return;
        if (pickingProxy.atom) {
            if (this.atomPicked && this.lastPickedAtomComponent === pickingProxy.component) {
                let component = pickingProxy.component;
                TestModification.addBondBetweenAtoms(stage, component, this.lastPickedAtom.index, pickingProxy.atom.index);
                component.reprList.forEach((value) => {
                    //let reprName: string = value.parameters.name;
                    let repr = value.repr;
                    repr.build();
                });
                this.atomPicked = false;
            }
            else {
                this.lastPickedAtom = pickingProxy.atom;
                this.lastPickedAtomComponent = pickingProxy.component;
                this.atomPicked = true;
            }
        }
    }
    clickPick_left_bondFromAtom(stage, pickingProxy) {
        if (!pickingProxy || !(pickingProxy.component instanceof StructureComponent))
            return;
        if (pickingProxy.atom) {
            //let text: string = "You've picked an atom!";
            //text += " Here's its component and also the stage:";
            //console.log(text);
            //console.log(pickingProxy.component);
            //console.log(stage);
            let component = pickingProxy.component;
            let structure = component.object;
            //let atomStore: AtomStore = structure.atomStore; // Atom data is stored here!
            //let bondStore: BondStore = structure.bondStore; // Bond data is stored here!
            //console.log("And now the AtomStore and BondStore:");
            //console.log(atomStore);
            //console.log(bondStore);
            console.assert(stage === component.stage);
            console.assert(stage.viewer === component.viewer);
            //let sb: StructureBuilder = new StructureBuilder(structure);
            //sb.addAtom(0, '', '', '', 0, false);
            let id = structure.atomMap.add('Steve', 'Johnson');
            //console.log("ID of newly added atom/element pair: " + id);
            TestModification.addSomething(stage, component, pickingProxy.atom.index, id);
        }
        else {
            if (pickingProxy.bond) {
                console.log("You've picked a bond!");
            }
            else {
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
    static addBondBetweenAtoms(stage, component, atomIndex1, atomIndex2) {
        //let atomStore: AtomStore = structure.atomStore;
        let bondStore = component.structure.bondStore;
        let bondCount = bondStore.count;
        {
            bondStore.growIfFull();
            bondStore.atomIndex1[bondCount] = atomIndex1;
            bondStore.atomIndex2[bondCount] = atomIndex2;
            bondStore.bondOrder[bondCount] = 1;
        }
        ++bondStore.count;
        component.structure.finalizeBonds();
    }
    static addSomething(stage, component, atomIndex, atomTypeId) {
        let atomStore = component.structure.atomStore;
        let bondStore = component.structure.bondStore;
        let pos = stage.mouseObserver.getWorldPosition();
        console.log(pos);
        let x = atomStore.x[atomIndex];
        let y = atomStore.y[atomIndex];
        let z = atomStore.z[atomIndex];
        //let offset = new Vector3(x, y, z);
        //let componentTransformation: Matrix4 = component.matrix;
        //let camPos: Vector3 = stage.viewer.camera.position;
        let camMat = stage.viewer.camera.matrix;
        console.log("Camera matrix:");
        console.log(camMat);
        let atomCount = atomStore.count;
        let bondCount = bondStore.count;
        {
            atomStore.growIfFull();
            atomStore.x[atomCount] = x;
            atomStore.y[atomCount] = y;
            atomStore.z[atomCount] = z + 10;
            atomStore.altloc[atomCount] = 0;
            atomStore.atomTypeId[atomCount] = atomTypeId;
            atomStore.bfactor[atomCount] = Math.random() * 40;
            if (atomStore.formalCharge)
                atomStore.formalCharge[atomCount] = 0;
            if (atomStore.partialCharge)
                atomStore.partialCharge[atomCount] = 0;
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
        component.structure.finalizeAtoms();
        component.structure.finalizeBonds();
        component.reprList.forEach(function (value) {
            let repr = value.repr;
            let structureView = repr.structure;
            console.assert(component.structure === structureView.structure);
            structureView.refresh();
            repr.build();
        });
        console.log("AtomStore and BondStore");
        console.log(atomStore);
        console.log(bondStore);
    }
}
export default TestModification;
//# sourceMappingURL=TEST.js.map