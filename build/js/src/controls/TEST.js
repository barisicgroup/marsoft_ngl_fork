/**
 *
 */
import StructureComponent from "../component/structure-component";
import CartoonRepresentation from "../representation/cartoon-representation";
import BallAndStickRepresentation from "../representation/ballandstick-representation";
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
        if (pickingProxy) {
            let text = "You've picked";
            if (pickingProxy.atom) {
                text += " an atom";
            }
            else if (pickingProxy.bond) {
                text += " a bond";
            }
            else {
                text += "... something";
            }
            text += "! Here's its component and also the stage:";
            console.log(text);
            console.log(pickingProxy.component);
            console.log(stage);
            if (pickingProxy.component instanceof StructureComponent) {
                let component = pickingProxy.component;
                let structure = component.object;
                let atomStore = structure.atomStore; // Atom data is stored here!
                let bondStore = structure.bondStore; // Bond data is stored here!
                console.log("And now the AtomStore and BondStore:");
                console.log(atomStore);
                console.log(bondStore);
                console.assert(stage === component.stage);
                console.assert(stage.viewer === component.viewer);
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
                    }
                });
            }
        }
    }
}
export default TestModification;
//# sourceMappingURL=TEST.js.map