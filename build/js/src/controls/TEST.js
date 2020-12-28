/**
 *
 */
import StructureComponent from "../component/structure-component";
import CartoonRepresentation from "../representation/cartoon-representation";
import BallAndStickRepresentation from "../representation/ballandstick-representation";
//import StructureBuilder from "../structure/structure-builder";
class TestModification {
    // Initialize member variables
    constructor( /* Maybe have some input*/) {
        // Maybe do some stuff...
    }
    hover(stage, pickingProxy) {
        if (pickingProxy) {
            //console.log("Hovered over some structure!");
        }
    }
    clickPick_left(stage, pickingProxy) {
        if (pickingProxy && pickingProxy.atom) {
            let text = "You've picked an atom!";
            text += "! Here's its component and also the stage:";
            console.log(text);
            console.log(pickingProxy.component);
            console.log(stage);
            if (pickingProxy.component instanceof StructureComponent) {
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
                console.log("ID of newly added atom/element pair: " + id);
                TestModification.addSomething(stage, component, pickingProxy.atom.index, id);
                /*structure.atomStore._fields.forEach((field: StoreField) => {
                    let fieldName: string = field[0];
                    console.log(fieldName);
                    console.log(structure.atomStore[fieldName]);
                }) ;*/
                console.log("And now some representations of this component");
                component.reprList.forEach((value) => {
                    let reprName = value.parameters.name;
                    let repr = value.repr;
                    if (reprName === 'cartoon') {
                        console.assert(repr instanceof CartoonRepresentation);
                        console.log(repr);
                    }
                    else if (reprName === 'ball+stick') {
                        console.assert(repr instanceof BallAndStickRepresentation);
                        console.log(repr);
                        //let basRepr: BallAndStickRepresentation = <BallAndStickRepresentation> repr;
                        //const what: BondDataFields | AtomDataFields = { color: true };
                        //basRepr.update(what);
                    }
                    // Update everything (TODO: ...for now)
                    repr.update({ position: true, color: true, radius: true, picking: true, index: true });
                });
            }
        }
        else if (pickingProxy) {
            if (pickingProxy.bond) {
                console.log("You've picked a bond!");
            }
            else {
                console.log("You've picked... something!");
            }
        }
    }
    static addSomething(stage, component, atomIndex, atomTypeId) {
        let structure = component.structure;
        let atomStore = structure.atomStore;
        let bondStore = structure.bondStore;
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
            atomStore.bfactor[atomCount] = Math.random() * 40; // TODO: No idea what a good dummy value would be here...
            if (atomStore.formalCharge)
                atomStore.formalCharge[atomCount] = 0;
            if (atomStore.partialCharge)
                atomStore.partialCharge[atomCount] = 0;
            atomStore.residueIndex[atomCount] = 1000; // TODO: No idea what a good dummy value would be here...
            atomStore.serial[atomCount] = atomCount + 1;
            atomStore.occupancy[atomCount] = 1;
            bondStore.growIfFull();
            bondStore.atomIndex1[bondCount] = atomIndex;
            bondStore.atomIndex2[bondCount] = atomCount;
            bondStore.bondOrder[bondCount] = 1; // TODO: No idea what a good dummy value would be here...
        }
        ++atomStore.count;
        ++bondStore.count;
        console.log("AtomStore and BondStore");
        console.log(atomStore);
        console.log(bondStore);
    }
}
export default TestModification;
//# sourceMappingURL=TEST.js.map